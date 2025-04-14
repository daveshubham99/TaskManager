import { Box, Container, Flex, useColorModeValue } from '@chakra-ui/react';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  
  return (
    <Flex direction="column" minH="100vh" bg={bgColor}>
      <Navbar />
      <Container maxW="container.xl" py={8} flex={1}>
        <Box>{children}</Box>
      </Container>
      <Box 
        as="footer" 
        py={4} 
        textAlign="center" 
        borderTopWidth="1px" 
        borderColor={useColorModeValue('gray.200', 'gray.700')}
        color={useColorModeValue('gray.600', 'gray.400')}
        fontSize="sm"
      >
        Task Manager © {new Date().getFullYear()}
      </Box>
    </Flex>
  );
};

export default Layout; 