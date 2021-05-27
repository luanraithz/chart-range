import { forwardRef, memo, useEffect, useRef, useState } from 'react';
import { Line } from 'react-chartjs-2'
import Draggable from 'react-draggable';
import './App.css';

let width, height, gradient;
function getGradient(ctx, chartArea) {
  const chartWidth = chartArea.right - chartArea.left;
  const chartHeight = chartArea.bottom - chartArea.top;
  if (gradient === null || width !== chartWidth || height !== chartHeight) {
    // Create the gradient because this is either the first render
    // or the size of the chart has changed
    width = chartWidth;
    height = chartHeight;
    gradient = ctx.createLinearGradient(chartArea.right, 0, chartArea.left, 0);
    console.log(chartWidth.create)
    gradient.addColorStop(0, "red");
    gradient.addColorStop(0.4, "orange");
    gradient.addColorStop(0.6, "yellow");
    gradient.addColorStop(1, "green");
  }

  return gradient;
}

const labels = new Array(100).fill().map((_, i) => i + 1)
const data = {
  labels,
  datasets: [
    {
      label: 'Dataset 1',
      data: labels.map(() => Math.round(Math.random() * 100)),
      fill: true,
      stepped: false,
      tension: 0,
      backgroundColor: function (context) {
        const chart = context.chart;
        const { ctx, chartArea } = chart;

        if (!chartArea) {
          // This case happens on initial chart load
          return null;
        }
        return getGradient(ctx, chartArea);
      },
      borderColor: function (context) {
        const chart = context.chart;
        const { ctx, chartArea } = chart;

        if (!chartArea) {
          // This case happens on initial chart load
          return null;
        }
        return getGradient(ctx, chartArea);
      },
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
        plugins: {
          legend: {
            display: false,
            position: 'top',
          },
        }
      }
      }

    />
  )
}))
function App() {
  const [first, setFirst] = useState(30)
  const [chartRef, setChartRef] = useState(null)
  const [wrapperRef, setWrapperRef] = useState(null)
  const { width, height } = chartRef?.chartArea ?? {}
  const [distanceFromTop, setDistanceFromTop] = useState(0)
  const [draggingY, setDraggingY] = useState(0)
  const [distanceFromLeft, setDistanceFromLeft] = useState(0)
  useEffect(() => {
    if (chartRef && wrapperRef) {
      const { top, left } = chartRef?.chartArea ?? {}
      const wrapperDistanceFromTop = wrapperRef.getBoundingClientRect().top
      const wrapperDistanceFromLeft = wrapperRef.getBoundingClientRect().left

      setDistanceFromTop(top - wrapperDistanceFromTop)
      setDistanceFromLeft(left - wrapperDistanceFromLeft)
    }
  }, [chartRef, wrapperRef])
  const firstPosition = Math.max(draggingY, distanceFromLeft)
  return (
    <div ref={setWrapperRef} className="App">
      <MemoLineChart ref={setChartRef} />
      <div className="absolute-left" style={{ height, top: distanceFromTop, width: firstPosition - distanceFromLeft + 5, left: distanceFromLeft - 5 }}></div>
      <Draggable
        axis="x"
        allowAnyClick={false}
        position={{ x: firstPosition, y: 0 }}
        scale={1}
        offsetParent={wrapperRef}
        onDrag={x => {
          setDraggingY(x.x)
        }}
        onStop={x => {
          const start = Math.round(((x.x - distanceFromLeft) * 100) / chartRef.chartArea.width)
          console.log(`parou perto dos ${start}%`)
        }}
      >
        <div className="cursor-1" style={{ height: height - 3, top: distanceFromTop }}>
          <div className="cursor-content">
            <div className="cursor-drag">

            </div>

          </div>
        </div>
      </Draggable>
      <div className="absolute-right"></div>
    </div>
  );
}

export default App;
