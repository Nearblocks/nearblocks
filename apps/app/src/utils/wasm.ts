/**
 * Utility functions for WebAssembly (WASM) contract analysis
 */

/**
 * Calculate the size of WASM binary from base64 encoded string
 */
export const calculateWasmSize = (base64Code: string): number => {
  try {
    if (
      !base64Code ||
      typeof base64Code !== 'string' ||
      base64Code.length === 0
    ) {
      console.error('Invalid base64Code input for size calculation');
      return 0;
    }
    return atob(base64Code).length;
  } catch (error) {
    console.error('Error calculating WASM size:', error);
    return 0;
  }
};

/**
 * Format bytes to human readable format (e.g., "123.45 KB")
 */
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Detect the programming language used to compile the WASM contract by analyzing
 * language-specific markers embedded in the compiled binary
 */
export const detectWasmLanguage = (base64Code: string): string => {
  try {
    if (
      !base64Code ||
      typeof base64Code !== 'string' ||
      base64Code.length === 0
    ) {
      console.error('Invalid base64Code input for language detection');
      return 'Unknown';
    }

    const binaryString = atob(base64Code);
    const wasmBytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      wasmBytes[i] = binaryString.charCodeAt(i);
    }

    // Convert bytes to string in chunks to avoid stack overflow
    const chunkSize = 8192;
    let wasmString = '';
    for (let i = 0; i < wasmBytes.length; i += chunkSize) {
      const chunk = wasmBytes.slice(i, i + chunkSize);
      wasmString += String.fromCharCode(...chunk);
    }

    const languageMarkers = [
      {
        name: 'Rust',
        markers: [
          'rust',
          'rustc',
          'cargo',
          '.rs',
          'core::',
          'alloc::',
          'std::',
          '__rust_',
        ],
      },
      {
        name: 'AssemblyScript',
        markers: ['AssemblyScript', 'asc', 'assemblyscript', '~lib/'],
      },
      {
        name: 'JavaScript',
        markers: ['javascript', 'emscripten', 'emscripten_', '__emscripten_'],
      },
      { name: 'Python', markers: ['python', '.py', 'PyO3', 'pyo3', '__pyo3_'] },
      {
        name: 'Go',
        markers: ['golang', '.go', 'tinygo', 'runtime.go', 'main.go', 'go.mod'],
      },
      {
        name: 'C#',
        markers: [
          'csharp',
          '.cs',
          'dotnet',
          'System.Runtime',
          'System.',
          'Microsoft.',
          'mscorlib',
          '.NET',
        ],
      },
      {
        name: 'C/C++',
        markers: ['__cpp', 'std::', 'stdlib', 'clang', 'gcc', 'g++'],
      },
      { name: 'Zig', markers: ['zig', '.zig', 'zig_'] },
    ];

    for (const { name, markers } of languageMarkers) {
      if (markers.some((marker) => wasmString.includes(marker))) {
        return name;
      }
    }

    return 'Unknown';
  } catch (error) {
    console.error('Error detecting WASM language:', error);
    return 'Unknown';
  }
};

/**
 * Download WASM binary as a file to the user's system
 */
export const downloadWasm = (
  base64Code: string,
  filename: string = 'contract.wasm',
): boolean => {
  try {
    const binaryString = atob(base64Code);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const blob = new Blob([bytes], { type: 'application/wasm' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.endsWith('.wasm') ? filename : `${filename}.wasm`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('Error downloading WASM:', error);
    return false;
  }
};

/**
 * Extract contract metadata embedded in WASM custom sections
 */
export const extractWasmMetadata = (
  base64Code: string,
): Record<string, any> | null => {
  try {
    const wasmString = atob(base64Code);
    const hasMetadata =
      /metadata/i.test(wasmString) || /contract_info/i.test(wasmString);
    return hasMetadata ? { hasMetadata: true } : null;
  } catch (error) {
    console.error('Error extracting WASM metadata:', error);
    return null;
  }
};

/**
 * Validate that a base64 string represents a valid WASM binary by checking
 * the standard WASM file header
 */
export const isValidWasm = (base64Code: string): boolean => {
  try {
    const binaryString = atob(base64Code);
    if (binaryString.length < 4) return false;

    return (
      binaryString.charCodeAt(0) === 0x00 &&
      binaryString.charCodeAt(1) === 0x61 &&
      binaryString.charCodeAt(2) === 0x73 &&
      binaryString.charCodeAt(3) === 0x6d
    );
  } catch (error) {
    return false;
  }
};

/**
 * Extract exported function names from WASM binary by parsing the export section.
 * Filters out internal functions that start with double underscores.
 */
export const extractWasmMethods = (base64Code: string): string[] => {
  try {
    if (
      !base64Code ||
      typeof base64Code !== 'string' ||
      base64Code.length === 0
    ) {
      console.error('Invalid base64Code input');
      return [];
    }

    const binaryString = atob(base64Code);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    if (
      bytes.length < 8 ||
      bytes[0] !== 0x00 ||
      bytes[1] !== 0x61 ||
      bytes[2] !== 0x73 ||
      bytes[3] !== 0x6d
    ) {
      console.error('Invalid WASM file');
      return [];
    }

    const methods: string[] = [];
    let pos = 8;

    while (pos < bytes.length) {
      if (pos + 1 >= bytes.length) break;

      const sectionId = bytes[pos++];
      const { value: sectionSize, newPos } = decodeLEB128(bytes, pos);
      pos = newPos;

      if (pos + sectionSize > bytes.length) break;

      if (sectionId === 7) {
        const sectionEnd = pos + sectionSize;
        const { value: count, newPos: countPos } = decodeLEB128(bytes, pos);
        pos = countPos;

        for (let i = 0; i < count && pos < sectionEnd; i++) {
          const { value: nameLen, newPos: nameLenPos } = decodeLEB128(
            bytes,
            pos,
          );
          pos = nameLenPos;

          const nameBytes = bytes.slice(pos, pos + nameLen);
          const name = new TextDecoder().decode(nameBytes);
          pos += nameLen;

          const kind = bytes[pos++];
          const { newPos: indexPos } = decodeLEB128(bytes, pos);
          pos = indexPos;

          if (kind === 0 && !name.startsWith('__')) {
            methods.push(name);
          }
        }
        break;
      } else {
        pos += sectionSize;
      }
    }

    return methods;
  } catch (error) {
    console.error('Error extracting WASM methods:', error);
    return [];
  }
};

/**
 * Decode LEB128 (Little Endian Base 128) unsigned integer from byte array
 */
const decodeLEB128 = (
  bytes: Uint8Array,
  pos: number,
): { value: number; newPos: number } => {
  let value = 0n;
  let shift = 0n;
  let byte: number;

  do {
    if (pos >= bytes.length) {
      throw new Error('Unexpected end of LEB128 data');
    }
    byte = bytes[pos++];
    value |= BigInt(byte & 0x7f) << shift;
    shift += 7n;
  } while (byte & 0x80);

  // Check if value exceeds JavaScript safe integer range
  if (value > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new Error(
      `LEB128 value ${value} exceeds JavaScript safe integer range (max: ${Number.MAX_SAFE_INTEGER})`,
    );
  }

  return { value: Number(value), newPos: pos };
};
