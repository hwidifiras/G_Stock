import React from "react"
import ReactApexChart from "react-apexcharts"
import { ApexOptions } from "apexcharts"

interface PieChartProps {
  chartData: number[]
  chartOptions: ApexOptions
  width?: string | number
  height?: string | number
}

const PieChart: React.FC<PieChartProps> = ({ 
  chartData, 
  chartOptions, 
  width = "100%", 
  height = "100%" 
}) => {
  return (
    <ReactApexChart
      options={chartOptions}
      series={chartData}
      type="pie"
      width={width}
      height={height}
    />
  )
}

export default PieChart
