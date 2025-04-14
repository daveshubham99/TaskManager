import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Select,
  Textarea,
  VStack,
  HStack,
  useColorModeValue,
} from '@chakra-ui/react';

const TaskForm = ({ task = {}, onSubmit, isSubmitting, onCancel }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      status: task?.status || 'pending',
      priority: task?.priority || 'medium',
      dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
    },
  });

  useEffect(() => {
    if (task?._id) {
      reset({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'pending',
        priority: task.priority || 'medium',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      });
    }
  }, [task, reset]);

  const formBgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Box
      as="form"
      onSubmit={handleSubmit(onSubmit)}
      p={5}
      shadow="md"
      borderWidth="1px"
      borderRadius="lg"
      bg={formBgColor}
      borderColor={borderColor}
    >
      <VStack spacing={4} align="flex-start">
        <FormControl isInvalid={errors.title}>
          <FormLabel htmlFor="title">Task Title</FormLabel>
          <Input
            id="title"
            placeholder="Enter task title"
            {...register('title', {
              required: 'Title is required',
              maxLength: {
                value: 100,
                message: 'Title cannot exceed 100 characters',
              },
            })}
          />
          <FormErrorMessage>{errors.title && errors.title.message}</FormErrorMessage>
        </FormControl>

        <FormControl>
          <FormLabel htmlFor="description">Description</FormLabel>
          <Textarea
            id="description"
            placeholder="Enter task description (optional)"
            {...register('description', {
              maxLength: {
                value: 1000,
                message: 'Description cannot exceed 1000 characters',
              },
            })}
          />
          <FormErrorMessage>
            {errors.description && errors.description.message}
          </FormErrorMessage>
        </FormControl>

        <HStack width="100%" spacing={4}>
          <FormControl>
            <FormLabel htmlFor="status">Status</FormLabel>
            <Select id="status" {...register('status')}>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel htmlFor="priority">Priority</FormLabel>
            <Select id="priority" {...register('priority')}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Select>
          </FormControl>
        </HStack>

        <FormControl>
          <FormLabel htmlFor="dueDate">Due Date</FormLabel>
          <Input id="dueDate" type="date" {...register('dueDate')} />
        </FormControl>

        <HStack width="100%" justify="flex-end" pt={4} spacing={4}>
          {onCancel && (
            <Button onClick={onCancel} variant="outline">
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            colorScheme="blue"
            isLoading={isSubmitting}
            loadingText="Saving"
          >
            {task?._id ? 'Update Task' : 'Create Task'}
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default TaskForm; 