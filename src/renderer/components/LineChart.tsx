import React from "react"
import ReactApexChart from "react-apexcharts"
import { ApexOptions } from "apexcharts"

interface LineChartProps {
  chartData: any[]
  chartOptions: ApexOptions
  width?: string | number
  height?: string | number
}

const LineChart: React.FC<LineChartProps> = ({ 
  chartData, 
  chartOptions, 
  width = "100%", 
  height = "100%" 
}) => {
  return (
    <ReactApexChart
      options={chartOptions}
      series={chartData}
      type="line"
      width={width}
      height={height}
    />
  )
}

export default LineChart
