import React from 'react';
import { ChainEvent } from '../../types';
import {
  formatBtcFromSats,
  formatFeeRate,
  formatAge,
  formatDuration,
} from '../../utils/formatters';
import { Zap, CheckCircle2 } from 'lucide-react';

interface WhyThisTriggeredProps {
  event: ChainEvent;
  className?: string;
}

export const WhyThisTriggered: React.FC<WhyThisTriggeredProps> = ({
  event,
  className = '',
}) => {
  const meta = event.metadata || {};

  // Extract explicit backend metadata triggers without inventing arbitrary thresholds
  const getTriggers = (): Array<{ label: string; value: string; note?: string }> => {
    switch (event.event_type) {
      case 'DORMANT_COINS_MOVED':
      case 'DORMANT_UTXO_SPENT': {
        const triggers: Array<{ label: string; value: string; note?: string }> = [];
        if (meta.total_dormant_sats !== undefined) {
          triggers.push({
            label: 'Dormant Value Moved',
            value: formatBtcFromSats(meta.total_dormant_sats as number),
          });
        } else if (meta.total_dormant_btc !== undefined) {
          triggers.push({
            label: 'Dormant Value Moved',
            value: `${meta.total_dormant_btc} BTC`,
          });
        }

        if (meta.oldest_input_age_days !== undefined) {
          triggers.push({
            label: 'Oldest Spent Output Age',
            value: formatAge(Number(meta.oldest_input_age_days), Number(meta.oldest_input_age_seconds)),
          });
        }

        if (meta.dormant_input_count !== undefined) {
          triggers.push({
            label: 'Dormant Inputs Spent',
            value: `${meta.dormant_input_count} of ${meta.total_input_count ?? '?'} inputs`,
          });
        }

        if (meta.classification) {
          triggers.push({
            label: 'Dormancy Classification',
            value: String(meta.classification),
          });
        }

        return triggers;
      }

      case 'LARGE_TRANSFER': {
        const triggers: Array<{ label: string; value: string }> = [];
        if (meta.total_output_sats !== undefined) {
          triggers.push({
            label: 'Total Value Transferred',
            value: formatBtcFromSats(meta.total_output_sats as number),
          });
        } else if (meta.total_output_btc !== undefined) {
          triggers.push({
            label: 'Total Value Transferred',
            value: `${meta.total_output_btc} BTC`,
          });
        }

        if (meta.fee_rate_sat_vb !== undefined && meta.fee_rate_sat_vb !== null) {
          triggers.push({
            label: 'Fee Rate',
            value: formatFeeRate(Number(meta.fee_rate_sat_vb)),
          });
        }

        if (meta.inputs_count !== undefined && meta.outputs_count !== undefined) {
          triggers.push({
            label: 'Transaction Structure',
            value: `${meta.inputs_count} inputs → ${meta.outputs_count} outputs`,
          });
        }

        return triggers;
      }

      case 'EXTREME_FEE':
      case 'FEE_SPIKE': {
        const triggers: Array<{ label: string; value: string }> = [];
        if (meta.fee_sats !== undefined) {
          triggers.push({
            label: 'Absolute Transaction Fee',
            value: formatBtcFromSats(meta.fee_sats as number),
          });
        }

        if (meta.fee_rate_sat_vb !== undefined && meta.fee_rate_sat_vb !== null) {
          triggers.push({
            label: 'Fee Rate',
            value: formatFeeRate(Number(meta.fee_rate_sat_vb)),
          });
        }

        if (meta.fee_trigger_type) {
          triggers.push({
            label: 'Trigger Mode',
            value: String(meta.fee_trigger_type).replace(/_/g, ' '),
          });
        }

        return triggers;
      }

      case 'CONSOLIDATION': {
        const triggers: Array<{ label: string; value: string }> = [];
        if (meta.input_count !== undefined && meta.output_count !== undefined) {
          triggers.push({
            label: 'Consolidation Structure',
            value: `${meta.input_count} inputs → ${meta.output_count} outputs`,
          });
        }
        if (meta.input_output_ratio !== undefined) {
          triggers.push({
            label: 'Input-to-Output Ratio',
            value: `${Number(meta.input_output_ratio).toFixed(1)} : 1`,
          });
        }
        if (meta.total_input_sats !== undefined) {
          triggers.push({
            label: 'Consolidated Value',
            value: formatBtcFromSats(meta.total_input_sats as number),
          });
        }
        return triggers;
      }

      case 'FAN_OUT': {
        const triggers: Array<{ label: string; value: string }> = [];
        if (meta.input_count !== undefined && meta.output_count !== undefined) {
          triggers.push({
            label: 'Dispersal Structure',
            value: `${meta.input_count} inputs → ${meta.output_count} outputs`,
          });
        }
        if (meta.output_input_ratio !== undefined) {
          triggers.push({
            label: 'Output-to-Input Ratio',
            value: `${Number(meta.output_input_ratio).toFixed(1)} : 1`,
          });
        }
        if (meta.total_distributed_sats !== undefined) {
          triggers.push({
            label: 'Distributed Value',
            value: formatBtcFromSats(meta.total_distributed_sats as number),
          });
        }
        return triggers;
      }

      case 'TRANSACTION_REPLACEMENT':
      case 'RBF_REPLACEMENT': {
        const triggers: Array<{ label: string; value: string }> = [];
        if (meta.fee_delta_sats !== undefined) {
          triggers.push({
            label: 'Fee Delta',
            value: `+${formatBtcFromSats(meta.fee_delta_sats as number)}`,
          });
        }
        if (meta.fee_increase_percent !== undefined && meta.fee_increase_percent !== null) {
          triggers.push({
            label: 'Fee Increase',
            value: `+${Number(meta.fee_increase_percent).toFixed(1)}%`,
          });
        }
        if (meta.replaced_count !== undefined) {
          triggers.push({
            label: 'Replaced Transactions',
            value: `${meta.replaced_count} txs`,
          });
        }
        return triggers;
      }

      case 'LONG_BLOCK_INTERVAL': {
        const triggers: Array<{ label: string; value: string }> = [];
        if (meta.interval_seconds !== undefined) {
          triggers.push({
            label: 'Inter-Block Elapsed Time',
            value: formatDuration(Number(meta.interval_seconds)),
          });
        }
        if (meta.previous_block_hash) {
          triggers.push({
            label: 'Previous Block Anchor',
            value: `${String(meta.previous_block_hash).slice(0, 16)}...`,
          });
        }
        return triggers;
      }

      default: {
        return [
          {
            label: 'Detector Classification',
            value: event.event_type.replace(/_/g, ' '),
          },
          {
            label: 'Confidence Level',
            value: event.confidence.replace(/_/g, ' '),
          },
        ];
      }
    }
  };

  const triggers = getTriggers();

  return (
    <div
      className={`bg-zinc-900/70 border border-zinc-800 rounded-lg p-5 ${className}`}
      data-testid="why-this-triggered"
    >
      <div className="flex items-center gap-2 mb-3">
        <Zap className="w-4 h-4 text-amber-400" />
        <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-zinc-200">
          Why ObsChain Flagged This Event
        </h3>
      </div>

      <p className="text-xs text-zinc-400 font-sans mb-4 leading-relaxed">
        ObsChain detected anomalous on-chain patterns exceeding statistical and structural heuristics:
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 font-mono text-xs">
        {triggers.map((t, idx) => (
          <div
            key={`${t.label}-${idx}`}
            className="p-3 bg-zinc-950/60 rounded border border-zinc-800/80 flex flex-col justify-between"
          >
            <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{t.label}</span>
            </div>
            <div className="text-zinc-100 font-bold text-sm truncate" title={t.value}>
              {t.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
