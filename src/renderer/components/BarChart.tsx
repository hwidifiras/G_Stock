import React from "react"
import Chart from "react-apexcharts"
import { ApexOptions } from "apexcharts"

interface BarChartProps {
  chartData: any[]
  chartOptions: ApexOptions
  width?: string | number
  height?: string | number
}

const BarChart: React.FC<BarChartProps> = ({ 
  chartData, 
  chartOptions, 
  width = "100%", 
  height = "100%" 
}) => {
  return (
    <Chart
      options={chartOptions}
      series={chartData}
      type="bar"
      width={width}
      height={height}
    />
  )
}

export default BarChart
