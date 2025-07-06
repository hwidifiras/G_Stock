import {
  Flex,
  FormLabel,
  Textarea,
  Text,
  useColorModeValue,
  TextareaProps,
} from "@chakra-ui/react"

interface TextFieldProps extends Omit<TextareaProps, 'id'> {
  id?: string
  label: string
  extra?: string
  placeholder?: string
  mb?: string | number
}

export default function TextField({
  mb = "30px",
  id,
  label,
  extra,
  placeholder,
  ...rest
}: TextFieldProps) {
  const textColorPrimary = useColorModeValue("secondaryGray.900", "white")
  const bgPrimary = useColorModeValue("transparent", "navy.800")
  const borderPrimary = useColorModeValue(
    "secondaryGray.100",
    "whiteAlpha.100"
  )

  return (
    <Flex direction="column" mb={mb}>
      <FormLabel
        display="flex"
        ms="10px"
        htmlFor={id}
        fontSize="sm"
        color={textColorPrimary}
        fontWeight="bold"
        _hover={{ cursor: "pointer" }}
      >
        {label}
        {extra && (
          <Text fontSize="sm" fontWeight="normal" ms="2px">
            {extra}
          </Text>
        )}
      </FormLabel>
      <Textarea
        id={id}
        placeholder={placeholder}
        h="44px"
        maxH="44px"
        color={textColorPrimary}
        fontSize="sm"
        bg={bgPrimary}
        border="1px solid"
        borderColor={borderPrimary}
        borderRadius="16px"
        {...rest}
        _placeholder={{ color: "secondaryGray.500" }}
      />
    </Flex>
  )
}
