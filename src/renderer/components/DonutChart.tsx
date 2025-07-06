import React from "react"
import ReactApexChart from "react-apexcharts"
import { ApexOptions } from "apexcharts"

interface DonutChartProps {
  chartData: number[]
  chartOptions: ApexOptions
  width?: string | number
  height?: string | number
}

const DonutChart: React.FC<DonutChartProps> = ({ 
  chartData, 
  chartOptions, 
  width = "100%", 
  height = "100%" 
}) => {
  return (
    <ReactApexChart
      options={chartOptions}
      series={chartData}
      type="donut"
      width={width}
      height={height}
    />
  )
}

export default DonutChart
