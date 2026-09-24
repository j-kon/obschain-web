import React, { useMemo, useState, useCallback } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Node,
  Edge,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Network,
  X,
  Copy,
  Check,
  ExternalLink,
  Layers,
  Shield,
  Database,
  Users,
  BookOpen,
} from 'lucide-react';
import { IncidentGraph, GraphNode, GraphNodeType } from '../../types';
import { ChainBadge } from './ChainBadge';
import { EvidenceClassificationBadge } from './EvidenceClassificationBadge';
import { getTransactionExplorerUrl, getBlockExplorerUrl } from '../../utils/explorer';

interface IncidentGraphViewProps {
  graph: IncidentGraph;
  className?: string;
}

const MAX_RENDER_NODES = 100;
const MAX_RENDER_EDGES = 150;

export const IncidentGraphView: React.FC<IncidentGraphViewProps> = ({
  graph,
  className = '',
}) => {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Convert IncidentGraph to React Flow nodes and edges with automatic layout
  const { initialNodes, initialEdges, isTruncated } = useMemo(() => {
    const rawNodes = graph?.nodes || [];
    const rawEdges = graph?.edges || [];

    const isTrunc = rawNodes.length > MAX_RENDER_NODES || rawEdges.length > MAX_RENDER_EDGES;
    const renderNodes = rawNodes.slice(0, MAX_RENDER_NODES);
    const renderEdges = rawEdges.slice(0, MAX_RENDER_EDGES);

    // Dynamic layout coordinates based on node type
    const typeColumns: Record<GraphNodeType, number> = {
      ENTITY: 40,
      SOURCE: 260,
      EVIDENCE: 480,
      TRANSACTION: 720,
      BLOCK: 980,
      ADDRESS: 1200,
    };

    const typeCounters: Record<GraphNodeType, number> = {
      ENTITY: 0,
      SOURCE: 0,
      EVIDENCE: 0,
      TRANSACTION: 0,
      BLOCK: 0,
      ADDRESS: 0,
    };

    const nodes: Node[] = renderNodes.map((n) => {
      const colX = typeColumns[n.node_type] || 600;
      const count = typeCounters[n.node_type] || 0;
      typeCounters[n.node_type] = count + 1;
      const posY = 50 + count * 120;

      // Color scheme based on node type and chain
      let borderBg = 'border-slate-700 bg-slate-900 text-slate-200';
      if (n.node_type === 'TRANSACTION') {
        borderBg =
          n.chain === 'LIQUID'
            ? 'border-cyan-500/70 bg-cyan-950/40 text-cyan-200'
            : 'border-amber-500/70 bg-amber-950/40 text-amber-200';
      } else if (n.node_type === 'BLOCK') {
        borderBg = 'border-indigo-500/70 bg-indigo-950/40 text-indigo-200';
      } else if (n.node_type === 'ENTITY') {
        borderBg = 'border-purple-500/70 bg-purple-950/40 text-purple-200';
      } else if (n.node_type === 'EVIDENCE') {
        borderBg = 'border-emerald-500/70 bg-emerald-950/40 text-emerald-200';
      } else if (n.node_type === 'SOURCE') {
        borderBg = 'border-sky-500/70 bg-sky-950/40 text-sky-200';
      }

      return {
        id: n.id,
        position: { x: colX, y: posY },
        data: {
          label: (
            <div className="text-left font-mono space-y-1">
              <div className="flex items-center justify-between gap-1.5 text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                <span>{n.node_type}</span>
                {n.chain && <span>{n.chain}</span>}
              </div>
              <div className="text-xs font-semibold leading-tight line-clamp-2">
                {n.label}
              </div>
            </div>
          ),
          rawNode: n,
        },
        style: {
          borderRadius: '8px',
          padding: '10px',
          width: 190,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
        },
        className: `${borderBg} border cursor-pointer hover:border-white transition-all`,
      };
    });

    const edges: Edge[] = renderEdges.map((e, idx) => {
      // Style line by relationship type
      let strokeStyle: React.CSSProperties = { stroke: '#64748b', strokeWidth: 1.5 };
      let strokeDasharray = undefined;

      if (['SPENDS', 'CONFIRMED_IN', 'FORWARDS_TO', 'RETURNS_TO'].includes(e.relationship)) {
        // Solid verified structural relation
        strokeStyle = { stroke: '#10b981', strokeWidth: 2 };
      } else if (['ATTRIBUTED_TO', 'SUPPORTS', 'REFERENCES'].includes(e.relationship)) {
        // Dashed official disclosure / evidence relation
        strokeStyle = { stroke: '#38bdf8', strokeWidth: 1.5 };
        strokeDasharray = '5 5';
      } else if (e.relationship === 'POSSIBLY_RELATED') {
        // Dotted heuristic relation
        strokeStyle = { stroke: '#f59e0b', strokeWidth: 1.5 };
        strokeDasharray = '2 3';
      }

      return {
        id: `e-${e.source}-${e.target}-${idx}`,
        source: e.source,
        target: e.target,
        label: e.relationship.replace(/_/g, ' '),
        labelStyle: {
          fill: '#94a3b8',
          fontFamily: 'monospace',
          fontSize: 9,
          fontWeight: 600,
        },
        labelBgStyle: {
          fill: '#090d16',
          fillOpacity: 0.9,
          rx: 4,
          ry: 4,
        },
        labelBgPadding: [4, 2],
        style: strokeStyle,
        strokeDasharray,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: (strokeStyle.stroke as string) || '#64748b',
          width: 14,
          height: 14,
        },
      };
    });

    return { initialNodes: nodes, initialEdges: edges, isTruncated: isTrunc };
  }, [graph]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const raw = (node.data as { rawNode?: GraphNode })?.rawNode;
      if (raw) {
        setSelectedNode(raw);
      }
    },
    []
  );

  return (
    <div
      className={`bg-surface-card border border-surface-border rounded-xl p-6 space-y-4 ${className}`}
      data-testid="incident-graph-view"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-surface-border">
        <div>
          <h2 className="text-base font-bold font-mono text-white tracking-wide uppercase flex items-center gap-2">
            <Network className="w-5 h-5 text-amber-500" />
            <span>Forensic Flow &amp; Entity Graph</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Interactive relationship map linking transactions, blocks, entities, evidence, and attribution proofs.
          </p>
        </div>

        {isTruncated && (
          <div className="px-3 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono">
            Showing first {MAX_RENDER_NODES} nodes
          </div>
        )}
      </div>

      {/* Main Flow Canvas with Details Side Panel */}
      <div className="relative w-full h-[520px] rounded-xl overflow-hidden border border-surface-border bg-slate-950">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          minZoom={0.2}
          maxZoom={1.8}
        >
          <Background color="#1e293b" gap={20} size={1} variant={BackgroundVariant.Dots} />
          <Controls className="!bg-slate-900 !border-slate-700 !text-slate-200 fill-slate-200" />
          <MiniMap
            nodeColor={(n) => {
              if (n.className?.includes('border-amber')) return '#f59e0b';
              if (n.className?.includes('border-cyan')) return '#06b6d4';
              if (n.className?.includes('border-emerald')) return '#10b981';
              if (n.className?.includes('border-sky')) return '#38bdf8';
              if (n.className?.includes('border-purple')) return '#a855f7';
              return '#475569';
            }}
            className="!bg-slate-900/90 !border !border-slate-800 rounded-lg overflow-hidden"
          />
        </ReactFlow>

        {/* Selected Node Details Drawer */}
        {selectedNode && (
          <div className="absolute top-4 right-4 z-40 w-80 max-w-[90%] p-4 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl shadow-2xl font-mono text-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-700">
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                {selectedNode.node_type === 'TRANSACTION' && <Database className="w-3.5 h-3.5" />}
                {selectedNode.node_type === 'BLOCK' && <Layers className="w-3.5 h-3.5" />}
                {selectedNode.node_type === 'ENTITY' && <Users className="w-3.5 h-3.5" />}
                {selectedNode.node_type === 'SOURCE' && <BookOpen className="w-3.5 h-3.5" />}
                {selectedNode.node_type === 'EVIDENCE' && <Shield className="w-3.5 h-3.5" />}
                <span>{selectedNode.node_type} Details</span>
              </span>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-white transition-colors p-1 rounded hover:bg-slate-800"
                title="Close node inspector"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <div className="font-bold text-white text-sm leading-snug">
                {selectedNode.label}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between gap-1">
                <span className="truncate">ID: {selectedNode.id}</span>
                <button
                  onClick={() => handleCopy(selectedNode.id)}
                  className="text-slate-400 hover:text-white shrink-0"
                  title="Copy ID"
                >
                  {copiedText === selectedNode.id ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>

            {selectedNode.chain && (
              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-slate-400">Chain:</span>
                <ChainBadge chain={selectedNode.chain} size="sm" />
              </div>
            )}

            {/* Specialized Transaction Actions */}
            {selectedNode.node_type === 'TRANSACTION' && (
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <a
                  href={getTransactionExplorerUrl(selectedNode.id, selectedNode.chain || 'BITCOIN')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs w-full justify-center transition-colors"
                >
                  <span>Open in Block Explorer</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            {/* Specialized Block Actions */}
            {selectedNode.node_type === 'BLOCK' && (
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <a
                  href={getBlockExplorerUrl(selectedNode.label, selectedNode.chain || 'BITCOIN')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs w-full justify-center transition-colors"
                >
                  <span>Open Block Explorer</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            {/* Node Metadata / Attributes */}
            {selectedNode.metadata && Object.keys(selectedNode.metadata).length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-slate-800 text-[11px]">
                {Object.entries(selectedNode.metadata).map(([key, val]) => (
                  <div key={key} className="space-y-0.5">
                    <span className="text-slate-400 uppercase tracking-wider text-[10px]">
                      {key}:
                    </span>
                    {key.toLowerCase().includes('confidence') || key.toLowerCase().includes('classification') ? (
                      <div className="pt-0.5">
                        <EvidenceClassificationBadge classification={String(val) as any} size="sm" />
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-1 text-slate-200 break-all bg-slate-950 p-1.5 rounded border border-slate-800">
                        <span className="truncate">{String(val)}</span>
                        <button
                          onClick={() => handleCopy(String(val))}
                          className="text-slate-400 hover:text-white shrink-0"
                          title="Copy value"
                        >
                          {copiedText === String(val) ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Visual Relationship Legend */}
      <div className="p-3.5 rounded-lg bg-surface-subtle border border-surface-border text-xs font-mono space-y-2">
        <div className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <span>Graph Legend &amp; Certainty Semantics</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
          <div className="flex items-center gap-2 text-emerald-400">
            <span className="w-6 h-0.5 bg-emerald-500 shrink-0" />
            <span>Solid: Verified On-Chain Flow</span>
          </div>
          <div className="flex items-center gap-2 text-sky-400">
            <span className="w-6 h-0.5 border-t border-dashed border-sky-400 shrink-0" />
            <span>Dashed: Official Attribution</span>
          </div>
          <div className="flex items-center gap-2 text-amber-400">
            <span className="w-6 h-0.5 border-t border-dotted border-amber-400 shrink-0" />
            <span>Dotted: Heuristic Link</span>
          </div>
        </div>
      </div>
    </div>
  );
};
