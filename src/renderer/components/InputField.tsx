import {
  Flex,
  FormLabel,
  Input,
  Text,
  useColorModeValue,
  InputProps,
} from "@chakra-ui/react"

interface InputFieldProps extends Omit<InputProps, 'id'> {
  id?: string
  label: string
  extra?: string
  placeholder?: string
  type?: string
  mb?: string | number
}

export default function InputField({
  id,
  label,
  extra,
  placeholder,
  type = "text",
  mb = "30px",
  ...rest
}: InputFieldProps) {
  const textColorPrimary = useColorModeValue("secondaryGray.900", "white")

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
          <Text fontSize="sm" fontWeight="400" ms="2px">
            {extra}
          </Text>
        )}
      </FormLabel>
      <Input
        {...rest}
        type={type}
        id={id}
        fontWeight="500"
        variant="main"
        placeholder={placeholder}
        _placeholder={{ fontWeight: "400", color: "secondaryGray.600" }}
        h="44px"
        maxH="44px"
      />
    </Flex>
  )
}
