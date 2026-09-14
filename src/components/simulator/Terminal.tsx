import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

import { useSimulatorStore } from '../../stores/useSimulatorStore';
import { useTerminalStore } from '../../stores/useTerminalStore';

import { executeCommand, getAutocomplete } from '../../engine/commands';

/*
 * IMPORTANTE:
 * Esta constante fica fora do componente para que o selector
 * nunca crie um novo [] a cada render.
 */
const EMPTY_LINES: string[] = [];

export function Terminal() {
  /*
   * Zustand - Terminal
   */
  const deviceId = useTerminalStore((s) => s.deviceId);

  const lines = useTerminalStore((s) =>
    s.deviceId ? (s.lines[s.deviceId] ?? EMPTY_LINES) : EMPTY_LINES,
  );

  const history = useTerminalStore((s) => s.history);

  const appendLines = useTerminalStore((s) => s.appendLines);

  const clearLines = useTerminalStore((s) => s.clearLines);

  const addHistory = useTerminalStore((s) => s.addHistory);

  const closeTerminal = useTerminalStore((s) => s.closeTerminal);

  /*
   * Zustand - Simulator
   */
  const topology = useSimulatorStore((s) => s.topology);

  const arpTables = useSimulatorStore((s) => s.arpTables);

  const runTransmissions = useSimulatorStore((s) => s.runTransmissions);

  const addArpEntries = useSimulatorStore((s) => s.addArpEntries);

  /*
   * Estado local
   */
  const [input, setInput] = useState('');

  const [historyIndex, setHistoryIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  /*
   * Dispositivo atual
   */
  const device = topology.devices.find((d) => d.id === deviceId);

  const prompt = device ? `${device.config.hostname}> ` : '> ';

  /*
   * Mantém o terminal sempre rolado para o final
   * quando chegam novas linhas.
   */
  useEffect(() => {
    const el = scrollRef.current;

    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [lines]);

  /*
   * Coloca o foco no campo de comando quando
   * o dispositivo do terminal muda.
   */
  useEffect(() => {
    inputRef.current?.focus();
  }, [deviceId]);

  /*
   * Executa um comando.
   */
  const run = (raw: string) => {
    if (!deviceId || !device) return;

    const command = raw.trim();

    /*
     * Mostra o comando digitado.
     */
    appendLines(deviceId, [prompt + raw]);

    /*
     * Enter vazio não executa nada.
     */
    if (!command) return;

    /*
     * Salva no histórico.
     */
    addHistory(command);

    setHistoryIndex(-1);

    /*
     * Executa o comando no engine.
     */
    const result = executeCommand(command, {
      topology,
      deviceId,
      arpTable: arpTables[deviceId] ?? [],
    });

    /*
     * Limpa o terminal quando solicitado.
     */
    if (result.clear) {
      clearLines(deviceId);
    } else if (result.output.length) {

    /*
     * Adiciona a saída do comando.
     */
      appendLines(deviceId, result.output);
    }

    /*
     * Executa transmissões de rede.
     */
    if (result.transmissions.length) {
      runTransmissions(result.transmissions);
    }

    /*
     * Aprende entradas ARP.
     */
    if (result.arpLearned.length) {
      addArpEntries(result.arpLearned);
    }
  };

  /*
   * Teclas especiais do terminal.
   */
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    /*
     * ENTER
     */
    if (e.key === 'Enter') {
      e.preventDefault();

      run(input);

      setInput('');

      return;
    }

    /*
     * SETA PARA CIMA
     *
     * Percorre o histórico para trás.
     */
    if (e.key === 'ArrowUp') {
      e.preventDefault();

      if (history.length === 0) return;

      const next = Math.min(historyIndex + 1, history.length - 1);

      setHistoryIndex(next);

      setInput(history[next]);

      return;
    }

    /*
     * SETA PARA BAIXO
     *
     * Percorre o histórico para frente.
     */
    if (e.key === 'ArrowDown') {
      e.preventDefault();

      const next = historyIndex - 1;

      setHistoryIndex(next);

      setInput(next >= 0 ? history[next] : '');

      return;
    }

    /*
     * TAB
     *
     * Autocomplete.
     */
    if (e.key === 'Tab') {
      e.preventDefault();

      const tokens = input.split(/\s+/);

      const current = tokens[tokens.length - 1] ?? '';

      const matches = getAutocomplete(current);

      /*
       * Apenas uma opção:
       * completa automaticamente.
       */
      if (matches.length === 1 && tokens.length === 1) {
        setInput(matches[0] + ' ');
      } else if (matches.length > 1) {

      /*
       * Mais de uma opção:
       * mostra as possibilidades no terminal.
       */
        appendLines(deviceId ?? '', [prompt + input, matches.join('   ')]);
      }

      return;
    }

    /*
     * CTRL + L
     *
     * Limpa o terminal.
     */
    if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();

      if (deviceId) {
        clearLines(deviceId);
      }
    }
  };

  /*
   * Caso o dispositivo tenha sido removido
   * enquanto o terminal estava aberto.
   */
  if (!device) {
    return null;
  }

  return (
    <div className="flex flex-col h-full bg-[#070b12]">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[--color-border-primary] bg-[--color-bg-secondary] shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-300">
            Console
          </span>

          <span className="text-[10px] font-mono text-emerald-400">
            {device.name}
          </span>

          <span className="text-[10px] text-slate-600">
            digite "help" para ver os comandos
          </span>
        </div>

        <button
          onClick={closeTerminal}
          className="p-1 rounded text-slate-500 hover:text-slate-200 hover:bg-[--color-bg-hover] cursor-pointer"
          title="Fechar console"
          type="button"
        >
          <X size={13} />
        </button>
      </div>

      {/* Área de saída */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-3 py-2 font-mono text-[11px] leading-relaxed"
        onClick={() => inputRef.current?.focus()}
      >
        {lines.length === 0 && (
          <p className="text-slate-600">
            Laboratório NetLab — console de {device.name}
          </p>
        )}

        {lines.map((line, i) => (
          <pre
            key={`${i}-${line}`}
            className={
              line.startsWith(prompt)
                ? 'text-slate-300 whitespace-pre-wrap'
                : 'text-slate-400 whitespace-pre-wrap'
            }
          >
            {line}
          </pre>
        ))}
      </div>

      {/* Linha de comando */}
      <div className="flex items-center gap-1 px-3 py-1.5 border-t border-[--color-border-primary] bg-[--color-bg-secondary] shrink-0">
        <span className="font-mono text-[11px] text-emerald-400">{prompt}</span>

        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          spellCheck={false}
          autoComplete="off"
          className="flex-1 bg-transparent font-mono text-[11px] text-slate-100 focus:outline-none caret-emerald-400"
          aria-label="Comando do terminal"
        />
      </div>
    </div>
  );
}
