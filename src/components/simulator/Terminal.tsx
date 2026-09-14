import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { useSimulatorStore } from '../../stores/useSimulatorStore';
import { useTerminalStore } from '../../stores/useTerminalStore';
import { executeCommand, getAutocomplete } from '../../engine/commands';

export function Terminal() {
  const deviceId = useTerminalStore(s => s.deviceId);
  const lines = useTerminalStore(s => (s.deviceId ? s.lines[s.deviceId] ?? [] : []));
  const history = useTerminalStore(s => s.history);
  const appendLines = useTerminalStore(s => s.appendLines);
  const clearLines = useTerminalStore(s => s.clearLines);
  const addHistory = useTerminalStore(s => s.addHistory);
  const closeTerminal = useTerminalStore(s => s.closeTerminal);

  const topology = useSimulatorStore(s => s.topology);
  const arpTables = useSimulatorStore(s => s.arpTables);
  const runTransmissions = useSimulatorStore(s => s.runTransmissions);
  const addArpEntries = useSimulatorStore(s => s.addArpEntries);

  const [input, setInput] = useState('');
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const device = topology.devices.find(d => d.id === deviceId);
  const prompt = device ? `${device.config.hostname}> ` : '> ';

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [deviceId]);

  const run = (raw: string) => {
    if (!deviceId || !device) return;
    const command = raw.trim();
    appendLines(deviceId, [prompt + raw]);
    if (!command) return;
    addHistory(command);
    setHistoryIndex(-1);

    const result = executeCommand(command, {
      topology,
      deviceId,
      arpTable: arpTables[deviceId] ?? [],
    });

    if (result.clear) {
      clearLines(deviceId);
    } else if (result.output.length) {
      appendLines(deviceId, result.output);
    }

    if (result.transmissions.length) runTransmissions(result.transmissions);
    if (result.arpLearned.length) addArpEntries(result.arpLearned);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      run(input);
      setInput('');
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      const next = Math.min(historyIndex + 1, history.length - 1);
      setHistoryIndex(next);
      setInput(history[next]);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = historyIndex - 1;
      setHistoryIndex(next);
      setInput(next >= 0 ? history[next] : '');
      return;
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      const tokens = input.split(/\s+/);
      const current = tokens[tokens.length - 1] ?? '';
      const matches = getAutocomplete(current);
      if (matches.length === 1 && tokens.length === 1) {
        setInput(matches[0] + ' ');
      } else if (matches.length > 1) {
        appendLines(deviceId ?? '', [prompt + input, matches.join('   ')]);
      }
      return;
    }
    if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      if (deviceId) clearLines(deviceId);
    }
  };

  if (!device) return null;

  return (
    <div className="flex flex-col h-full bg-[#070b12]">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[--color-border-primary] bg-[--color-bg-secondary] shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-300">Console</span>
          <span className="text-[10px] font-mono text-emerald-400">{device.name}</span>
          <span className="text-[10px] text-slate-600">digite "help" para ver os comandos</span>
        </div>
        <button
          onClick={closeTerminal}
          className="p-1 rounded text-slate-500 hover:text-slate-200 hover:bg-[--color-bg-hover] cursor-pointer"
        >
          <X size={13} />
        </button>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-3 py-2 font-mono text-[11px] leading-relaxed"
        onClick={() => inputRef.current?.focus()}
      >
        {lines.length === 0 && (
          <p className="text-slate-600">Laboratório NetLab — console de {device.name}</p>
        )}
        {lines.map((line, i) => (
          <pre
            key={i}
            className={
              line.startsWith(prompt) ? 'text-slate-300 whitespace-pre-wrap' : 'text-slate-400 whitespace-pre-wrap'
            }
          >
            {line}
          </pre>
        ))}
      </div>

      <div className="flex items-center gap-1 px-3 py-1.5 border-t border-[--color-border-primary] bg-[--color-bg-secondary] shrink-0">
        <span className="font-mono text-[11px] text-emerald-400">{prompt}</span>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          spellCheck={false}
          autoComplete="off"
          className="flex-1 bg-transparent font-mono text-[11px] text-slate-100 focus:outline-none caret-emerald-400"
        />
      </div>
    </div>
  );
}
