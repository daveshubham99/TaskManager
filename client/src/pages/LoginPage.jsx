import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  VStack,
  Heading,
  Text,
  Link,
  useToast,
  useColorModeValue,
  Container,
  InputGroup,
  InputRightElement,
  IconButton,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, register, isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  const {
    register: registerForm,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm();
  
  // Check for registration query param
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('register') === 'true') {
      setIsRegistering(true);
    }
  }, [location.search]);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Reset form when switching between login and register
  useEffect(() => {
    reset();
  }, [isRegistering, reset]);

  const onSubmit = async (data) => {
    try {
      let result;
      
      if (isRegistering) {
        result = await register(data.name, data.email, data.password);
      } else {
        result = await login(data.email, data.password);
      }

      if (result.success) {
        toast({
          title: isRegistering ? 'Account created.' : 'Login successful',
          description: isRegistering ? "We've created your account for you." : 'Welcome back!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        navigate('/');
      } else {
        toast({
          title: 'Error',
          description: result.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast({
        title: 'An error occurred.',
        description: 'Unable to process your request.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const toggleShowPassword = () => setShowPassword(!showPassword);
  const toggleAuthMode = () => setIsRegistering(!isRegistering);

  const formBgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Box 
      minH="100vh" 
      display="flex" 
      alignItems="center" 
      justifyContent="center"
      bg={useColorModeValue('gray.50', 'gray.900')}
      py={12}
    >
      <Container maxW="md">
        <Box 
          p={8} 
          shadow="lg" 
          borderRadius="lg" 
          bg={formBgColor} 
          borderWidth="1px"
          borderColor={borderColor}
        >
          <VStack spacing={8} align="flex-start">
            <Box textAlign="center" w="full">
              <Heading>{isRegistering ? 'Create an Account' : 'Welcome Back'}</Heading>
              <Text mt={2} color={useColorModeValue('gray.600', 'gray.400')}>
                {isRegistering 
                  ? 'Create your account to manage tasks' 
                  : 'Sign in to access your tasks'}
              </Text>
            </Box>
            
            <Box as="form" onSubmit={handleSubmit(onSubmit)} w="100%">
              <VStack spacing={4}>
                {isRegistering && (
                  <FormControl isInvalid={errors.name}>
                    <FormLabel htmlFor="name">Name</FormLabel>
                    <Input
                      id="name"
                      placeholder="Enter your name"
                      {...registerForm('name', {
                        required: isRegistering ? 'Name is required' : false,
                      })}
                    />
                    <FormErrorMessage>
                      {errors.name && errors.name.message}
                    </FormErrorMessage>
                  </FormControl>
                )}

                <FormControl isInvalid={errors.email}>
                  <FormLabel htmlFor="email">Email</FormLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    {...registerForm('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    })}
                  />
                  <FormErrorMessage>
                    {errors.email && errors.email.message}
                  </FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={errors.password}>
                  <FormLabel htmlFor="password">Password</FormLabel>
                  <InputGroup>
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      {...registerForm('password', {
                        required: 'Password is required',
                        minLength: {
                          value: 6,
                          message: 'Password must be at least 6 characters',
                        },
                      })}
                    />
                    <InputRightElement>
                      <IconButton
                        size="sm"
                        variant="ghost"
                        icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                        onClick={toggleShowPassword}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      />
                    </InputRightElement>
                  </InputGroup>
                  <FormErrorMessage>
                    {errors.password && errors.password.message}
                  </FormErrorMessage>
                </FormControl>

                <Button
                  colorScheme="blue"
                  w="100%"
                  type="submit"
                  mt={4}
                  isLoading={isSubmitting}
                  loadingText={isRegistering ? 'Creating Account' : 'Signing In'}
                >
                  {isRegistering ? 'Register' : 'Login'}
                </Button>
              </VStack>
            </Box>

            <Box textAlign="center" w="full">
              <Text>
                {isRegistering ? 'Already have an account?' : "Don't have an account?"}
                {' '}
                <Link
                  color="blue.500"
                  onClick={toggleAuthMode}
                  _hover={{ textDecoration: 'underline', cursor: 'pointer' }}
                >
                  {isRegistering ? 'Sign In' : 'Sign Up'}
                </Link>
              </Text>
            </Box>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
};

export default LoginPage; 