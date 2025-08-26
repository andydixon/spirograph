import Head from 'next/head';
import { useState, useEffect, useRef, useCallback } from 'react';
import styles from '../styles/Home.module.css';
import Canvas from '../components/Canvas';
import Controls from '../components/Controls';

// Load the WASM bridge script via a global function
const loadWasmBridge = () => {
  if (typeof window !== 'undefined' && typeof Go === 'undefined') {
    const script = document.createElement('script');
    script.src = '/wasm_exec.js';
    document.body.appendChild(script);
  }
};

loadWasmBridge();

export default function Spirograph() {
  const [params, setParams] = useState({
    R: 200,
    r: 120,
    dArray: [80],
    penColors: ['#007bff'],
    inside: false,
    speed: 10,
    lineWidth: 2,
  });
  const [isPanelOpen, setIsPanelOpen] = useState(true);

  const [pointsToDraw, setPointsToDraw] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const getWasmFunction = useCallback(async () => {
    if (typeof window === 'undefined') return null;
    while (typeof Go === 'undefined') {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    const go = new Go();
    const result = await WebAssembly.instantiateStreaming(fetch("/main.wasm"), go.importObject);
    go.run(result.instance);
    return window.spirograph;
  }, []);

  const drawSpirograph = useCallback(async () => {
    const spirographFunc = await getWasmFunction();
    if (!spirographFunc) return;
    
    setIsDrawing(true);
    const calculatedPoints = spirographFunc(
      params.R,
      params.r,
      params.dArray,
      params.inside
    );
    setPointsToDraw(calculatedPoints);
  }, [params, getWasmFunction]);

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
    setPointsToDraw(null);
  }, []);

  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    setParams(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : parseFloat(value)
    }));
  };

  const handlePenChange = (index, key, value) => {
    const updatedPens = params.dArray.map((d, i) =>
      i === index ? (key === 'd' ? parseFloat(value) : d) : d
    );
    const updatedColors = params.penColors.map((color, i) =>
      i === index ? (key === 'color' ? value : color) : color
    );
    setParams(prev => ({
      ...prev,
      dArray: updatedPens,
      penColors: updatedColors
    }));
  };

  const addPen = () => {
    setParams(prev => ({
      ...prev,
      dArray: [...prev.dArray, 0],
      penColors: [...prev.penColors, '#ffc107']
    }));
  };

  const removePen = (index) => {
    if (params.dArray.length > 1) {
      setParams(prev => ({
        ...prev,
        dArray: prev.dArray.filter((_, i) => i !== index),
        penColors: prev.penColors.filter((_, i) => i !== index)
      }));
    }
  };

  const handlePresetChange = (e) => {
    const preset = e.target.value;
    let newParams = { ...params };
    switch (preset) {
      case 'classicFlower': newParams = { R: 200, r: 120, dArray: [100], penColors: ['#e74c3c'], inside: true, speed: 10, lineWidth: 2 }; break;
      case 'starburst': newParams = { R: 160, r: 40, dArray: [80], penColors: ['#f1c40f'], inside: true, speed: 10, lineWidth: 2 }; break;
      case 'rosette': newParams = { R: 240, r: 100, dArray: [120], penColors: ['#3498db'], inside: false, speed: 10, lineWidth: 2 }; break;
      case 'toroidalDonut': newParams = { R: 240, r: 200, dArray: [100], penColors: ['#9b59b6'], inside: true, speed: 10, lineWidth: 2 }; break;
      case 'complexRosette': newParams = { R: 210, r: 120, dArray: [150], penColors: ['#e67e22'], inside: true, speed: 10, lineWidth: 2 }; break;
      case 'fineLineFlower': newParams = { R: 200, r: 160, dArray: [180], penColors: ['#1abc9c'], inside: true, speed: 10, lineWidth: 2 }; break;
      case 'simpleEpicycloid': newParams = { R: 180, r: 60, dArray: [60], penColors: ['#34495e'], inside: false, speed: 10, lineWidth: 2 }; break;
      default: break;
    }
    setParams(newParams);
  };

  const generateShareableUrl = () => {
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.set('R', params.R);
    urlSearchParams.set('r', params.r);
    urlSearchParams.set('d', params.dArray.join(','));
    urlSearchParams.set('colors', params.penColors.join(','));
    urlSearchParams.set('inside', params.inside);
    urlSearchParams.set('speed', params.speed);
    urlSearchParams.set('lineWidth', params.lineWidth);
    return `${window.location.origin}${window.location.pathname}?${urlSearchParams.toString()}`;
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(generateShareableUrl());
      alert('Link copied to clipboard!');
    } catch (err) {
      alert('Failed to copy link.');
    }
  };

  useEffect(() => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const parsedParams = Object.fromEntries(urlSearchParams.entries());
    if (Object.keys(parsedParams).length > 0) {
      setParams({
        R: parseFloat(parsedParams.R) || 200,
        r: parseFloat(parsedParams.r) || 120,
        dArray: parsedParams.d ? parsedParams.d.split(',').map(Number) : [80],
        penColors: parsedParams.colors ? parsedParams.colors.split(',') : ['#007bff'],
        inside: parsedParams.inside === 'true',
        speed: parseFloat(parsedParams.speed) || 10,
        lineWidth: parseFloat(parsedParams.lineWidth) || 2,
      });
      setTimeout(drawSpirograph, 500);
    }
  }, [drawSpirograph]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Spirograph Simulator</title>
        <link rel="icon" href="/favicon.ico" />
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
          rel="stylesheet"
        />
      </Head>

      <Canvas
        pointsToDraw={pointsToDraw}
        params={params}
        isDrawing={isDrawing}
        setIsDrawing={setIsDrawing}
      />

      {isPanelOpen ? (
        <Controls
          params={params}
          onParamsChange={handleInputChange}
          onDraw={drawSpirograph}
          onStop={stopDrawing}
          addPen={addPen}
          removePen={removePen}
          handlePenChange={handlePenChange}
          handlePresetChange={handlePresetChange}
          onTogglePanel={() => setIsPanelOpen(false)}
          onGenerateUrl={generateShareableUrl}
          onCopyUrl={handleCopyUrl}
        />
      ) : (
        <button
          onClick={() => setIsPanelOpen(true)}
          style={{
            position: 'fixed',
            top: '50px',
            left: '50px',
            background: 'rgba(52, 58, 64, 0.9)',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            padding: '10px 15px',
            borderRadius: '8px',
            zIndex: 1000
          }}
        >
          Show
        </button>
      )}
    </div>
  );
}