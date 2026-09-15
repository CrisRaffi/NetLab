export interface OSILayer {
  number: number;
  name: string;
  pdu: string;
  function: string;
  examples: string[];
  protocols: string[];
  devices: string[];
  problem: string;
  real: string;
}

export interface TcpIpLayer {
  name: string;
  osiMapping: string;
  examples: string[];
  protocols: string[];
  problem: string;
}