import React, { useRef } from 'react';
import styles from '../styles/Home.module.css';

export default function Controls({
    params,
    onParamsChange,
    onDraw,
    onStop,
    addPen,
    removePen,
    handlePenChange,
    handlePresetChange,
    onTogglePanel,
    onGenerateUrl,
    onCopyUrl
}) {
    const controlsBoxRef = useRef(null);

    const handleDrag = () => {
        const controlsBox = controlsBoxRef.current;
        if (!controlsBox) return;

        let isDragging = false;
        let startX, startY, boxX, boxY;

        const handleMouseDown = (e) => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            boxX = controlsBox.offsetLeft;
            boxY = controlsBox.offsetTop;
        };

        const handleMouseMove = (e) => {
            if (!isDragging) return;
            e.preventDefault();
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            controlsBox.style.left = `${boxX + dx}px`;
            controlsBox.style.top = `${boxY + dy}px`;
        };

        const handleMouseUp = () => {
            isDragging = false;
        };

        const controlsHeader = controlsBox.querySelector(`.${styles.controlsHeader}`);
        if (controlsHeader) {
            controlsHeader.addEventListener('mousedown', handleMouseDown);
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            if (controlsHeader) {
                controlsHeader.removeEventListener('mousedown', handleMouseDown);
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            }
        };
    };

    // The handleDrag effect is no longer needed since the position is fixed
    // Let's rely on the CSS for styling and simplify this component.

    const handleCopyUrl = () => {
        const url = onGenerateUrl();
        navigator.clipboard.writeText(url).then(() => {
            alert('Link copied to clipboard!');
        }).catch(err => {
            alert('Failed to copy link.');
        });
    };

    return (
        <div className={styles.sidebarOpen} ref={controlsBoxRef}>
            <div className={styles.controlsHeader}>
                <h5>Spirograph Controls</h5>
                <button className={styles.toggleButton} onClick={onTogglePanel}>
                    Hide
                </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); onDraw(); }}>
                <div className="mb-3">
                    <label htmlFor="presets" className="form-label">Presets</label>
                    <select id="presets" className="form-select" onChange={handlePresetChange}>
                        <option value="custom">Custom</option>
                        <option value="classicFlower">Classic Flower (R=200, r=120, d=100)</option>
                        <option value="starburst">Starburst (R=160, r=40, d=80)</option>
                        <option value="rosette">Rosette (R=240, r=100, d=120, outside)</option>
                        <option value="toroidalDonut">Toroidal Donut (R=240, r=200, d=100, inside)</option>
                        <option value="complexRosette">Complex Rosette (R=210, r=120, d=150, inside)</option>
                        <option value="fineLineFlower">Fine Line Flower (R=200, r=160, d=180, inside)</option>
                        <option value="simpleEpicycloid">Simple Epicycloid (R=180, r=60, d=60, outside)</option>
                    </select>
                </div>

                <div className="mb-3">
                    <label htmlFor="R" className="form-label">Large Radius (R)</label>
                    <input type="number" className="form-control" id="R" value={params.R} onChange={onParamsChange} step="1" />
                </div>
                <div className="mb-3">
                    <label htmlFor="r" className="form-label">Small Radius (r)</label>
                    <input type="number" className="form-control" id="r" value={params.r} onChange={onParamsChange} step="1" />
                </div>
                <div id="pens-container">
                    <label className="form-label">Pen Positions (d) & Colors
                        <button type="button" className="btn btn-sm btn-secondary ms-2" onClick={addPen}>+</button>
                    </label>
                    {params.dArray.map((d, index) => (
                        <div key={index} className="input-group d-input-group mb-2">
                            <input type="number" className="form-control" value={d} step="1" onChange={(e) => handlePenChange(index, 'd', e.target.value)} />
                            <input type="color" className="form-control form-control-color w-auto" value={params.penColors[index]} onChange={(e) => handlePenChange(index, 'color', e.target.value)} />
                            {params.dArray.length > 1 && (
                                <button type="button" className="btn btn-sm btn-danger ms-2" onClick={() => removePen(index)}>-</button>
                            )}
                        </div>
                    ))}
                </div>

                <div className="mb-3">
                    <label htmlFor="speed" className="form-label">Drawing Speed (ms)</label>
                    <input type="number" className="form-control" id="speed" value={params.speed} onChange={onParamsChange} step="1" />
                </div>
                <div className="mb-3">
                    <label htmlFor="lineWidth" className="form-label">Line Thickness</label>
                    <input type="number" className="form-control" id="lineWidth" value={params.lineWidth} onChange={onParamsChange} step="1" min="1" />
                </div>
                <div className="mb-3 form-check">
                    <input className="form-check-input" type="checkbox" id="inside" checked={params.inside} onChange={onParamsChange} />
                    <label className="form-check-label" htmlFor="inside">Draw inside</label>
                </div>
                <div className="d-flex justify-content-between mt-3">
                    <button type="submit" className="btn btn-primary me-2">Draw</button>
                    <button type="button" className="btn btn-warning" onClick={() => alert('Pause logic goes here')}>Pause</button>
                    <button type="button" className="btn btn-danger ms-2" onClick={onStop}>Stop/Reset</button>
                </div>
            </form>

            <div className="mt-3">
                <button className="btn btn-secondary w-100" onClick={handleCopyUrl}>
                    Share This Design
                </button>
            </div>
        </div>
    );
}