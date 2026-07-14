'use client';

import { CheckCircle, RefreshCw, XCircle } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';

import { apiClient } from '../api/api-client';

export type ApprovalType = 'ONBOARDING' | 'SUBSCRIPTION';
export type ApprovalStage =
  | 'PENDING_MANAGER'
  | 'PENDING_ACCOUNTS'
  | 'PENDING_ADMIN'
  | 'APPROVED'
  | 'REJECTED';
export type ApprovalCaseStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type ApprovalAction = 'APPROVE' | 'REJECT';
export type EscalationLevel =
  | 'NONE'
  | 'ESCALATED_PARTNER_ADMIN'
  | 'ESCALATED_ADMIN'
  | 'ESCALATED_SUPER_ADMIN';

export interface ApprovalCaseRecord {
  id: string;
  type: ApprovalType;
  referenceId: string;
  tenantId: string | null;
  userId: string | null;
  currentStage: ApprovalStage;
  status: ApprovalCaseStatus;
  dueAt: string;
  escalationLevel: EscalationLevel;
  nextEscalationAt?: string | null;
  createdAt?: string;
}

export interface ApprovalDashboardClient {
  get<T>(url: string): Promise<{ data: T }>;
  post<T>(url: string, body?: unknown): Promise<{ data: T }>;
}

export interface ApprovalDashboardEndpoints {
  list: string;
  advance: (caseId: string) => string;
}

export interface UseApprovalCasesOptions {
  client?: ApprovalDashboardClient;
  endpoints?: Partial<ApprovalDashboardEndpoints>;
}

export interface UseApprovalCasesResult {
  cases: ApprovalCaseRecord[];
  isLoading: boolean;
  error: string | null;
  actingCaseId: string | null;
  refresh: () => Promise<void>;
  advanceCase: (caseId: string, action: ApprovalAction) => Promise<void>;
}

export interface ApprovalDashboardProps extends UseApprovalCasesOptions {
  now?: Date;
}

const DEFAULT_ENDPOINTS: ApprovalDashboardEndpoints = {
  list: '/approval-cases?status=PENDING',
  advance: (caseId) => `/approval-cases/${caseId}/advance`,
};

function mergeEndpoints(
  overrides?: Partial<ApprovalDashboardEndpoints>,
): ApprovalDashboardEndpoints {
  return { ...DEFAULT_ENDPOINTS, ...overrides };
}

function normalizeCases(data: ApprovalCaseRecord[] | { items?: ApprovalCaseRecord[] }) {
  return Array.isArray(data) ? data : data.items ?? [];
}

export function useApprovalCases({
  client = apiClient,
  endpoints,
}: UseApprovalCasesOptions = {}): UseApprovalCasesResult {
  const resolvedEndpoints = useMemo(() => mergeEndpoints(endpoints), [endpoints]);
  const [cases, setCases] = useState<ApprovalCaseRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actingCaseId, setActingCaseId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await client.get<ApprovalCaseRecord[] | { items?: ApprovalCaseRecord[] }>(
        resolvedEndpoints.list,
      );
      setCases(normalizeCases(response.data));
    } catch {
      setError('Unable to load pending approval cases.');
    } finally {
      setIsLoading(false);
    }
  }, [client, resolvedEndpoints]);

  const advanceCase = useCallback(
    async (caseId: string, action: ApprovalAction) => {
      setActingCaseId(caseId);
      setError(null);
      try {
        const response = await client.post<ApprovalCaseRecord>(
          resolvedEndpoints.advance(caseId),
          { action },
        );
        setCases((current) =>
          current
            .map((approvalCase) =>
              approvalCase.id === caseId ? response.data : approvalCase,
            )
            .filter((approvalCase) => approvalCase.status === 'PENDING'),
        );
      } catch {
        setError(`Unable to ${action.toLowerCase()} approval case.`);
      } finally {
        setActingCaseId(null);
      }
    },
    [client, resolvedEndpoints],
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { cases, isLoading, error, actingCaseId, refresh, advanceCase };
}

export function getApprovalSlaTone(
  approvalCase: ApprovalCaseRecord,
  now = new Date(),
): 'normal' | 'warning' | 'critical' {
  if (approvalCase.escalationLevel !== 'NONE') return 'critical';

  const dueAt = new Date(approvalCase.dueAt).getTime();
  const remainingMs = dueAt - now.getTime();
  if (Number.isNaN(dueAt) || remainingMs > 24 * 60 * 60 * 1000) return 'normal';
  if (remainingMs < 0) return 'critical';
  return 'warning';
}

function formatToken(value: string): string {
  return value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Not set' : date.toLocaleDateString();
}

const shellStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--sp-4)',
};

const toolbarStyle: CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  gap: 'var(--sp-3)',
  justifyContent: 'space-between',
};

const tableStyle: CSSProperties = {
  borderCollapse: 'collapse',
  width: '100%',
};

const cellStyle: CSSProperties = {
  borderBottom: '1px solid var(--bdr)',
  padding: '0.75rem',
  textAlign: 'left',
  verticalAlign: 'top',
};

const buttonBaseStyle: CSSProperties = {
  alignItems: 'center',
  border: '1px solid var(--bdr)',
  borderRadius: 'var(--r-sm)',
  cursor: 'pointer',
  display: 'inline-flex',
  font: 'inherit',
  fontWeight: 600,
  gap: '0.4rem',
  minHeight: 36,
  padding: '0.45rem 0.7rem',
};

function slaStyle(tone: ReturnType<typeof getApprovalSlaTone>): CSSProperties {
  if (tone === 'critical') {
    return {
      background: 'var(--brand-red-lt)',
      borderLeft: '4px solid var(--brand-red)',
    };
  }
  if (tone === 'warning') {
    return {
      background: 'var(--brand-blue-lt)',
      borderLeft: '4px solid var(--yellow)',
    };
  }
  return { borderLeft: '4px solid transparent' };
}

function statusLabel(tone: ReturnType<typeof getApprovalSlaTone>): string {
  if (tone === 'critical') return 'Critical';
  if (tone === 'warning') return 'Warning';
  return 'Normal';
}

export function ApprovalDashboard({
  client,
  endpoints,
  now = new Date(),
}: ApprovalDashboardProps) {
  const { cases, isLoading, error, actingCaseId, refresh, advanceCase } =
    useApprovalCases({ client, endpoints });

  return (
    <section aria-labelledby="approval-dashboard-title" style={shellStyle}>
      <div style={toolbarStyle}>
        <div>
          <h2 id="approval-dashboard-title">SLA Approval Dashboard</h2>
          <p>Review onboarding and subscription requests waiting for action.</p>
        </div>
        <button type="button" onClick={() => void refresh()} style={buttonBaseStyle}>
          <RefreshCw size={16} aria-hidden="true" /> Refresh
        </button>
      </div>

      {error ? <div role="alert">{error}</div> : null}
      {isLoading ? <div role="status">Loading approval cases...</div> : null}

      {!isLoading && cases.length === 0 ? (
        <div role="status">No pending approvals.</div>
      ) : null}

      {cases.length > 0 ? (
        <div style={{ overflowX: 'auto' }}>
          <table aria-label="Pending approval cases" style={tableStyle}>
            <thead>
              <tr>
                <th style={cellStyle}>Type</th>
                <th style={cellStyle}>Reference</th>
                <th style={cellStyle}>Stage</th>
                <th style={cellStyle}>Due Date</th>
                <th style={cellStyle}>SLA Status</th>
                <th style={cellStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((approvalCase) => {
                const tone = getApprovalSlaTone(approvalCase, now);
                const isActing = actingCaseId === approvalCase.id;
                return (
                  <tr key={approvalCase.id} style={slaStyle(tone)}>
                    <td style={cellStyle}>{formatToken(approvalCase.type)}</td>
                    <td style={cellStyle}>{approvalCase.referenceId}</td>
                    <td style={cellStyle}>{formatToken(approvalCase.currentStage)}</td>
                    <td style={cellStyle}>{formatDate(approvalCase.dueAt)}</td>
                    <td style={cellStyle}>{statusLabel(tone)}</td>
                    <td style={cellStyle}>
                      <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
                        <button
                          type="button"
                          disabled={isActing}
                          onClick={() => void advanceCase(approvalCase.id, 'APPROVE')}
                          style={{
                            ...buttonBaseStyle,
                            background: 'var(--brand-blue)',
                            color: 'var(--surf)',
                          }}
                        >
                          <CheckCircle size={16} aria-hidden="true" /> Approve
                        </button>
                        <button
                          type="button"
                          disabled={isActing}
                          onClick={() => void advanceCase(approvalCase.id, 'REJECT')}
                          style={{
                            ...buttonBaseStyle,
                            background: 'var(--brand-red-lt)',
                            color: 'var(--brand-red)',
                          }}
                        >
                          <XCircle size={16} aria-hidden="true" /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
