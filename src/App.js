import { forwardRef, memo, useEffect, useRef, useState } from 'react';
import { Line } from 'react-chartjs-2'
import Draggable from 'react-draggable';
import './App.css';

// Copied
let width, height, gradient;
function getGradient(ctx, chartArea) {
  const chartWidth = chartArea.right - chartArea.left;
  const chartHeight = chartArea.bottom - chartArea.top;
  if (gradient === null || width !== chartWidth || height !== chartHeight) {
    width = chartWidth;
    height = chartHeight;
    gradient = ctx.createLinearGradient(chartArea.right, 0, chartArea.left, 0);
    gradient.addColorStop(0, "red");
    gradient.addColorStop(0.4, "orange");
    gradient.addColorStop(0.6, "yellow");
    gradient.addColorStop(1, "green");
  }

  return gradient;
}

const half = new Array(20).fill().map((_, i) => Math.max(i + 1, 2))
const values = [...half.reverse(), ...half, ...half.reverse(), ...half, ...half.reverse()]
const labels = new Array(100).fill().map((_, i) => i)

function getColor(context) {
  const chart = context.chart;
  const { ctx, chartArea } = chart;

  return chartArea && getGradient(ctx, chartArea);
}

const data = {
  labels,
  datasets: [
    {
      label: 'Dataset 1',
      data: values,
      fill: true,
      startsAt: 0,
      stepped: false,
      lineTension: 1,
      backgroundColor: getColor,
      borderColor: getColor,
    },
  ]
};

const MemoLineChart = memo(forwardRef((props, ref) => {
  return (
    <Line
      data={data}
      ref={ref}
      options={{
        responsive: true,
        scales: { y: { beginAtZero: true } },
        plugins: { legend: { display: false, }, }
      }}
    />
  )
}))

function RangeChart({
  value = [0, 100],
  onChange = console.log,
  minInterval = 5
}) {
  const [chartRef, setChartRef] = useState(null)
  const [wrapperRef, setWrapperRef] = useState(null)
  const [draggingY, setDraggingY] = useState(value[0])
  const [draggingY2, setDraggingY2] = useState(value[1])
  const firstCursorRef = useRef(null);
  const secondCursorRef = useRef(null);
  const [distanceFromLeft, setDistanceFromLeft] = useState(30)
  useEffect(() => {
    if (chartRef && wrapperRef) {
      const { left } = chartRef?.chartArea ?? {}
      const wrapperDistanceFromLeft = wrapperRef.getBoundingClientRect().left

      setDistanceFromLeft(left - wrapperDistanceFromLeft)
    }
  }, [chartRef, wrapperRef])
  const { height = 0, width: chartWidth = 0 } = chartRef?.chartArea ?? {}
  const firstPosition = ((draggingY * chartWidth) / 100) + distanceFromLeft
  const secondPositionPercent = Math.min(Math.max(draggingY2, draggingY), 100)
  const secondPosition = (secondPositionPercent * chartWidth) / 100 + distanceFromLeft
  const rightWidth = chartRef?.chartArea?.width + distanceFromLeft + 7 - secondPosition || 0
  const topDistance = 10

  return (
    <div ref={setWrapperRef} className="App">
      <MemoLineChart ref={setChartRef} />
      <div className="absolute-left" style={{
        height: height + 10,
        top: 0,
        width: firstPosition - distanceFromLeft + 5,
        left: distanceFromLeft - 5
      }}></div>
      <Draggable
        axis="x"
        nodeRef={firstCursorRef}
        allowAnyClick={false}
        handle=".cursor"
        position={{ x: firstPosition, y: 0 }}
        scale={1}
        offsetParent={wrapperRef}
        onDrag={x => {
          const firstPositionPercent =
            Math.max(Math.min(Math.round(((x.x - distanceFromLeft) * 100) / chartRef.chartArea.width), 100), 0)
          const gonnaHitNext = firstPositionPercent + minInterval > draggingY2
          if (gonnaHitNext) {
            const v = draggingY2 - minInterval;
            setDraggingY(v)
            onChange([v, draggingY2])
            return false
          } else {
            setDraggingY(firstPositionPercent)
            onChange([firstPositionPercent, draggingY2])
          }
        }}
      >
        <div ref={firstCursorRef} className="cursor" style={{ height: height - 3, top: topDistance }}>
          <div className="cursor-content">
            <div className="cursor-drag"/>
          </div>
        </div>
      </Draggable>
      <div className="absolute-right"
        style={{ height: height + 10, top: 0, width: rightWidth, right: 0 }}
      ></div>
      <Draggable
        axis="x"
        allowAnyClick={false}
        nodeRef={secondCursorRef}
        handle=".cursor"
        position={{ x: secondPosition, y: 0 }}
        scale={1}
        offsetParent={wrapperRef}
        onDrag={x => {
          const positionPercent = Math.max(Math.min(Math.round(((x.x - distanceFromLeft) * 100) / chartRef.chartArea.width), 100), 0)
          const gonnaHitNext = positionPercent - minInterval < draggingY
          if (gonnaHitNext) {
            const v = draggingY + minInterval;
            setDraggingY2(v)
            onChange([draggingY, v])
            return false
          } else {
            setDraggingY2(positionPercent)
            onChange([draggingY, positionPercent])
          }
        }}
      >
        <div className="cursor" style={{ height: height - 3, top: topDistance }} ref={secondCursorRef}>
          <div className="cursor-content">
            <div className="cursor-drag">

            </div>

          </div>
        </div>
      </Draggable>
    </div >
  );
}

function App() {
  const [range, setRange] = useState([0, 100])
  return (
    <div>
      <h1> Range chart </h1>
      <div style={{ width: 700 }}>
        <RangeChart onChange={setRange} value={range} />
      </div>
      <h3>
        {range[0]} to {range[1]}
      </h3>

    </div>
  )
}
export default App;
