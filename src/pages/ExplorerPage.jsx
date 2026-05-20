import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import createPlotlyComponentModule from "react-plotly.js/factory";
import Plotly from "plotly.js-dist-min";

import { getCharacterNeighbors, getEmbeddingMap } from "../api/explorerApi";

const createPlotlyComponent =
  createPlotlyComponentModule.default || createPlotlyComponentModule;

const Plot = createPlotlyComponent(Plotly);

export default function ExplorerPage() {
  const [hskLevel, setHskLevel] = useState("all");
  const [points, setPoints] = useState([]);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [neighbors, setNeighbors] = useState([]);
  const [loadingMap, setLoadingMap] = useState(true);
  const [loadingNeighbors, setLoadingNeighbors] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const plotDivRef = useRef(null);
  const pointsRef = useRef([]);
  const clickHandlerRef = useRef(null);
  const [projectionMethod, setProjectionMethod] = useState("umap");

  useEffect(() => {
    pointsRef.current = points;
    }, [points]);

  useEffect(() => {
    async function loadMap() {
      try {
        setLoadingMap(true);
        setErrorMessage("");
        setSelectedPoint(null);
        setNeighbors([]);

        const data = await getEmbeddingMap(hskLevel, projectionMethod);
        setPoints(data.points || []);
      } catch (error) {
        console.error(error);
        setErrorMessage("Could not load the character similarity map.");
      } finally {
        setLoadingMap(false);
      }
    }

    loadMap();
  }, [hskLevel, projectionMethod]);

  async function handlePointSelected(point) {
    setSelectedPoint(point);
    setNeighbors([]);

    if (!point?.character) {
      return;
    }

    try {
      setLoadingNeighbors(true);

      const data = await getCharacterNeighbors(point.character, 5);
      setNeighbors(data.neighbors || []);
    } catch (error) {
      console.error(error);
      setNeighbors([]);
    } finally {
      setLoadingNeighbors(false);
    }
  }

  const plotData = useMemo(() => {
    return [
      {
        x: points.map((point) => point.x),
        y: points.map((point) => point.y),
        customdata: points,
        text: points.map((point) => {
          return `${point.character}<br>Pinyin: ${
            point.pinyin || "-"
          }<br>HSK: ${point.hsk_level || "-"}<br>Cluster: ${
            point.cluster
          }`;
        }),
        mode: "markers",
        type: "scatter",
        marker: {
          size: 7,
          opacity: 0.8,
          color: points.map((point) => point.cluster),
        },
        hoverinfo: "text",
      },
    ];
  }, [points]);

  const handlePlotClick = useCallback(
  (event) => {
    console.log("Plot clicked:", event.points?.[0]);

    const clickedPoint = event.points?.[0];

    if (!clickedPoint) {
      return;
    }

    const pointIndex = clickedPoint.pointIndex ?? clickedPoint.pointNumber;

    if (pointIndex === undefined || pointIndex === null) {
      return;
    }

    const selected = points[pointIndex];

    if (selected) {
      handlePointSelected(selected);
    }
  },
  [points]
  );

  const handlePlotEvent = useCallback(
  (event) => {
    console.log("Native Plotly click:", event.points?.[0]);

    const clickedPoint = event.points?.[0];

    if (!clickedPoint) {
      return;
    }

    const pointIndex = clickedPoint.pointIndex ?? clickedPoint.pointNumber;

    if (pointIndex === undefined || pointIndex === null) {
      return;
    }

    const selected = pointsRef.current[pointIndex];

    if (selected) {
      handlePointSelected(selected);
    }
  },
  []
    );

  const bindPlotlyEvents = useCallback(
  (figure, graphDiv) => {
    if (!graphDiv) {
      return;
    }

    plotDivRef.current = graphDiv;

    if (clickHandlerRef.current && graphDiv.removeListener) {
      graphDiv.removeListener("plotly_click", clickHandlerRef.current);
    }

    graphDiv.on("plotly_click", handlePlotEvent);
    clickHandlerRef.current = handlePlotEvent;
  },
  [handlePlotEvent]
);

  return (
    <div className="explorer-page">
      <section className="progress-header">
        <h1>Character Similarity Map</h1>
        <p>
          Explore the two-dimensional {projectionMethod.toUpperCase()} projection of the embedding space learned by the Siamese neural network.
        </p>

        <div className="explorer-controls">
          <label htmlFor="hsk-filter">HSK Level:</label>

          <select
            id="hsk-filter"
            value={hskLevel}
            onChange={(event) => setHskLevel(event.target.value)}
          >
            <option value="all">All Characters</option>
            <option value="1">HSK 1</option>
            <option value="2">HSK 2</option>
            <option value="3">HSK 3</option>
            <option value="4">HSK 4</option>
            <option value="5">HSK 5</option>
            <option value="6">HSK 6</option>
          </select>

          <label htmlFor="projection-method">Projection:</label>

          <select
            id="projection-method"
            value={projectionMethod}
            onChange={(event) => setProjectionMethod(event.target.value)}
          >
            <option value="umap">UMAP</option>
            <option value="tsne">t-SNE</option>
          </select>
        </div>
      </section>

      {loadingMap && (
        <div className="placeholder-page">
          <p>Loading similarity map...</p>
        </div>
      )}

      {errorMessage && (
        <div className="placeholder-page">
          <p className="error-message">{errorMessage}</p>
        </div>
      )}

      {!loadingMap && !errorMessage && (
        <div className="explorer-layout">
          <section className="map-card">
            <div className="map-info-bar">
              <span>{points.length} characters displayed</span>
              <span>Click a point to inspect its nearest neighbors.</span>
            </div>

            <Plot
              key={`${hskLevel}-${points.length}`}
              data={plotData}
              layout={{
                autosize: true,
                height: 620,
                paper_bgcolor: "#1E1E24",
                plot_bgcolor: "#121212",
                font: {
                  color: "#F5F5F5",
                },
                margin: {
                  l: 40,
                  r: 40,
                  t: 30,
                  b: 40,
                },
                xaxis: {
                  title: "Projection dimension 1",
                  zeroline: false,
                  gridcolor: "#2D3748",
                },
                yaxis: {
                  title: "Projection dimension 2",
                  zeroline: false,
                  gridcolor: "#2D3748",
                },
                hovermode: "closest",
                clickmode: "event+select",
                dragmode: "pan",
              }}
              config={{
                responsive: true,
                displaylogo: false,
                scrollZoom: true,
              }}
              style={{
                width: "100%",
              }}
              useResizeHandler={true}
              onInitialized={bindPlotlyEvents}
              onUpdate={bindPlotlyEvents}
            />
          </section>

          <aside className="character-detail-panel">
            {!selectedPoint ? (
              <div className="empty-detail-state">
                <h2>No character selected</h2>
                <p>Select a point on the map to inspect it.</p>
              </div>
            ) : (
              <>
                <div className="selected-character-header">
                  <div className="selected-character-large">
                    {selectedPoint.character}
                  </div>

                  <div>
                    <h2>Selected Character</h2>
                    <p>
                      <strong>Pinyin:</strong> {selectedPoint.pinyin || "-"}
                    </p>
                    <p>
                      <strong>HSK Level:</strong>{" "}
                      {selectedPoint.hsk_level || "-"}
                    </p>
                    <p>
                      <strong>Cluster:</strong> {selectedPoint.cluster}
                    </p>
                  </div>
                </div>

                <div className="neighbor-section">
                  <h3>Nearest Neighbors</h3>

                  {loadingNeighbors ? (
                    <p className="empty-message">Loading neighbors...</p>
                  ) : neighbors.length === 0 ? (
                    <p className="empty-message">
                      No neighbors available for this character.
                    </p>
                  ) : (
                    <div className="neighbor-list">
                      {neighbors.map((neighbor) => (
                        <div
                          className="neighbor-card"
                          key={neighbor.character}
                        >
                          <span className="neighbor-character">
                            {neighbor.character}
                          </span>

                          <div>
                            <p>
                              <strong>Pinyin:</strong>{" "}
                              {neighbor.pinyin || "-"}
                            </p>
                            <p>
                              <strong>Similarity:</strong>{" "}
                              {formatSimilarity(neighbor.similarity)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}

function formatSimilarity(value) {
  if (value === null || value === undefined) {
    return "-";
  }

  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) {
    return "-";
  }

  if (numericValue <= 1) {
    return `${Math.round(numericValue * 100)}%`;
  }

  return `${numericValue.toFixed(2)}%`;
}