import { Box, useStyleConfig, BoxProps } from "@chakra-ui/react"
import { ReactNode } from "react"

interface CardProps extends BoxProps {
  variant?: string
  children: ReactNode
}

function Card({ variant, children, ...rest }: CardProps) {
  const styles = useStyleConfig("Card", { variant })

  return (
    <Box __css={styles} {...rest}>
      {children}
    </Box>
  )
}

export default Card
