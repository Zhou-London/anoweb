import { useState } from "react";
import type * as Ch1Data from "../data/chapter1";

type Props = { data: typeof Ch1Data };

export default function Process({ data }: Props) {
  const { investmentProcess } = data;
  const [selectedStage, setSelectedStage] = useState<string>("data");
  const current =
    investmentProcess.stages.find((s) => s.id === selectedStage) ??
    investmentProcess.stages[0];

  return (
    <div className="section">
      <div className="section-header">
        <div className="eyebrow">Section 6</div>
        <h2 className="section-title">The Investment Process</h2>
        <p className="section-lede">
          Everything comes together here. Quant investing is organized around a
          pipeline: raw data becomes models, models become portfolios, portfolios
          become trades, and trades become lessons. Click any stage in the pipeline.
        </p>
      </div>

      <div className="pipeline">
        {investmentProcess.stages.map((stage, idx) => (
          <div key={stage.id} className="pipeline-wrap">
            <button
              type="button"
              className={`pipeline-stage ${selectedStage === stage.id ? "active" : ""}`}
              onClick={() => setSelectedStage(stage.id)}
            >
              <div className="pipeline-emoji">{stage.emoji}</div>
              <div className="pipeline-label">{stage.name}</div>
              <div className="pipeline-when">{stage.when}</div>
            </button>
            {idx < investmentProcess.stages.length - 1 && (
              <div className="pipeline-arrow">→</div>
            )}
          </div>
        ))}
      </div>

      <div className="stage-detail">
        <div className="stage-detail-header">
          <div className="stage-detail-emoji">{current.emoji}</div>
          <div>
            <h3>{current.name}</h3>
            <div className="stage-when">{current.when}</div>
          </div>
        </div>
        <p className="stage-desc">{current.description}</p>

        <div className="components-grid">
          {current.components.map((comp) => (
            <div key={comp.name} className="component-card">
              <div className="component-name">{comp.name}</div>
              <div className="component-desc">{comp.description}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="callout">
        <div className="callout-emoji">💡</div>
        <div>
          <strong>Why it matters:</strong> Each box is a separate team and discipline at
          a typical quant firm. Understanding the pipeline is how you understand where
          any specific technique fits into the bigger picture — and why it exists.
        </div>
      </div>
    </div>
  );
}
