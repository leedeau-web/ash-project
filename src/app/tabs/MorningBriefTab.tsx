'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

type Phase = 'idle' | 'loading' | 'done';

interface SavedResult {
  id: number;
  label: string;
  fileName: string;
  summary: string;
  pageCount: number;
}

const STORAGE_KEY = 'ash-brief-results';
const MAX_SAVED = 20;

function loadSaved(): SavedResult[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function saveResult(result: { summary: string; pageCount: number; fileName: string }) {
  const saved = loadSaved();
  const now = new Date();
  const label = `${now.getFullYear()}.${now.getMonth() + 1}.${now.getDate()}. ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} 분석 결과`;
  const entry: SavedResult = { id: Date.now(), label, fileName: result.fileName, summary: result.summary, pageCount: result.pageCount };
  const updated = [entry, ...saved].slice(0, MAX_SAVED);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export default function MorningBriefTab() {
  const [activeTab, setActiveTab] = useState<'analyze' | 'history'>('analyze');
  const [phase, setPhase] = useState<Phase>('idle');
  const [result, setResult] = useState<{ summary: string; pageCount: number; fileName: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savedList, setSavedList] = useState<SavedResult[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSavedList(loadSaved());
  }, []);

  const processFile = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('PDF 파일만 업로드 가능합니다.');
      return;
    }

    setPhase('loading');
    setError(null);
    setResult(null);

    try {
      // PDF → base64 (청크 방식으로 스택 오버플로 방지)
      const arrayBuffer = await file.arrayBuffer();
      const uint8 = new Uint8Array(arrayBuffer);
      let binary = '';
      for (let i = 0; i < uint8.length; i += 8192) {
        binary += String.fromCharCode(...uint8.subarray(i, i + 8192));
      }
      const base64 = btoa(binary);

      const apiKey = process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY;
      if (!apiKey) throw new Error('API 키가 설정되지 않았습니다. next.config.js 환경변수를 확인하세요.');

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 4000,
          messages: [{
            role: 'user',
            content: [
              {
                type: 'document',
                source: {
                  type: 'base64',
                  media_type: 'application/pdf',
                  data: base64,
                },
              },
              {
                type: 'text',
                text: `이 PDF는 보건복지부 조간 신문 스크랩입니다. 기사 제목 목록을 아래 형식으로 정리해주세요.

## 출력 형식 (정확히 준수)
■ [날짜] 주요뉴스(복지부 조간스크랩)

(보건의료)
▲ 기사 제목
▲ 기사 제목

(사회복지)
▲ 기사 제목
▲ 기사 제목

[주요 사설]
▲ 기사 제목 (3~4개만)

## 규칙
- 표지, 빈 페이지, 광고는 건너뛰기
- 인사이동, 부고, 訃告, 訃音 관련 제목은 완전히 제외
- 중복되거나 유사한 기사는 대표 제목 하나로 통합
- 언론사명 표기 없음
- 제목 외 상세 내용(* 설명 등) 없이 제목만
- (보건의료), (사회복지) 옆에 추가 설명 없이 그대로 표기
- 해당 카테고리 기사가 없으면 카테고리 생략
- 순수 텍스트만 출력`,
              },
            ],
          }],
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Claude API 오류 ${res.status}: ${errText}`);
      }

      const data = await res.json() as { content: Array<{ type: string; text: string }> };
      const summary = data.content.filter(b => b.type === 'text').map(b => b.text).join('');
      const resultData = { summary, pageCount: 0, fileName: file.name };
      setResult(resultData);
      setPhase('done');
      const updated = saveResult(resultData);
      setSavedList(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : '오류가 발생했습니다.');
      setPhase('idle');
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  };

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setPhase('idle');
    setResult(null);
    setError(null);
  };

  const deleteResult = (id: number) => {
    const updated = savedList.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setSavedList(updated);
    if (selectedId === id) setSelectedId(null);
  };

  const selectedResult = savedList.find(r => r.id === selectedId) ?? null;

  return (
    <div style={{ padding: '28px 0', maxWidth: 860 }}>

      {/* 내부 탭 */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid var(--border2)', paddingBottom: 0 }}>
        {(['analyze', 'history'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 20px',
              fontSize: 14,
              fontWeight: activeTab === tab ? 600 : 400,
              color: activeTab === tab ? 'var(--accent)' : 'var(--muted)',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab ? '2px solid var(--accent)' : '2px solid transparent',
              cursor: 'pointer',
              marginBottom: -1,
              transition: 'all 0.15s',
            }}
          >
            {tab === 'analyze' ? '요약 분석' : `분석 결과${savedList.length > 0 ? ` (${savedList.length})` : ''}`}
          </button>
        ))}
      </div>

      {/* 요약 분석 탭 */}
      {activeTab === 'analyze' && (
        <>
          {phase === 'idle' && (
            <div
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="card"
              style={{
                padding: '64px 40px',
                textAlign: 'center',
                cursor: 'pointer',
                border: `2px dashed ${isDragging ? 'var(--accent)' : 'var(--border2)'}`,
                background: isDragging ? 'var(--accent-light)' : 'var(--surface)',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ fontSize: 52, marginBottom: 18, lineHeight: 1 }}>📄</div>
              <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>
                PDF 파일을 드래그하거나 클릭하여 업로드
              </p>
              <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
                복지부 조간스크랩 PDF
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>
          )}

          {error && (
            <div style={{
              padding: '12px 16px', borderRadius: 10, marginTop: 16,
              border: '1px solid #fca5a5', background: '#fef2f2',
              color: '#dc2626', fontSize: 13,
            }}>
              ⚠️ {error}
            </div>
          )}

          {phase === 'loading' && (
            <div className="card" style={{ padding: 56, textAlign: 'center' }}>
              <div className="pulse-slow" style={{ fontSize: 52, marginBottom: 18, lineHeight: 1 }}>🤖</div>
              <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>
                PDF 분석 중...
              </p>
              <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7 }}>
                Claude AI가 기사를 추출하고 요약하고 있습니다.<br />
                페이지 수에 따라 1~2분 소요될 수 있습니다.
              </p>
            </div>
          )}

          {phase === 'done' && result && (
            <div className="fade-up">
              <div className="card" style={{
                padding: '14px 20px', marginBottom: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
              }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center', minWidth: 0 }}>
                  <span style={{ fontSize: 13, color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 340 }}>
                    📄 {result.fileName}
                  </span>
                  {result.pageCount > 0 && (
                    <span style={{ fontSize: 12, color: 'var(--muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                      · {result.pageCount}페이지
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button
                    onClick={handleCopy}
                    className="btn-ghost"
                    style={{ fontSize: 13, padding: '7px 16px', minWidth: 72 }}
                  >
                    {copied ? '✓ 복사됨' : '복사'}
                  </button>
                  <button
                    onClick={reset}
                    className="btn-ghost"
                    style={{ fontSize: 13, padding: '7px 16px' }}
                  >
                    다시 분석
                  </button>
                </div>
              </div>

              <div className="card" style={{ padding: '24px 28px' }}>
                <pre style={{
                  fontFamily: 'inherit',
                  fontSize: 14,
                  lineHeight: 1.85,
                  color: 'var(--text)',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  margin: 0,
                }}>
                  {result.summary}
                </pre>
              </div>
            </div>
          )}
        </>
      )}

      {/* 분석 결과 탭 */}
      {activeTab === 'history' && (
        <div>
          {savedList.length === 0 ? (
            <div className="card" style={{ padding: '56px 40px', textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 16, lineHeight: 1 }}>📭</div>
              <p style={{ fontSize: 15, color: 'var(--muted)' }}>아직 분석 결과가 없습니다.</p>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: selectedResult ? 20 : 0 }}>
                {savedList.map(item => (
                  <div
                    key={item.id}
                    className="card"
                    onClick={() => setSelectedId(selectedId === item.id ? null : item.id)}
                    style={{
                      padding: '14px 18px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                      border: selectedId === item.id ? '1.5px solid var(--accent)' : '1.5px solid var(--border2)',
                      background: selectedId === item.id ? 'var(--accent-light)' : 'var(--surface)',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>
                        {item.label}
                      </p>
                      <p style={{ fontSize: 12, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        📄 {item.fileName}{item.pageCount > 0 ? ` · ${item.pageCount}페이지` : ''}
                      </p>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); deleteResult(item.id); }}
                      className="btn-ghost"
                      style={{ fontSize: 16, padding: '4px 10px', flexShrink: 0, color: 'var(--muted)' }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              {selectedResult && (
                <div className="card fade-up" style={{ padding: '24px 28px' }}>
                  <pre style={{
                    fontFamily: 'inherit',
                    fontSize: 14,
                    lineHeight: 1.85,
                    color: 'var(--text)',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    margin: 0,
                  }}>
                    {selectedResult.summary}
                  </pre>
                </div>
              )}
            </>
          )}
        </div>
      )}

    </div>
  );
}
