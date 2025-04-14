import { useState } from 'react';
import {
  Box,
  Flex,
  Text,
  Badge,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
  HStack,
  Checkbox,
  useToast,
  Tooltip,
} from '@chakra-ui/react';
import { 
  FiMoreVertical, 
  FiEdit2, 
  FiTrash2, 
  FiClock, 
  FiCheckCircle 
} from 'react-icons/fi';
import { format } from 'date-fns';

const TaskItem = ({ task, onDelete, onEdit, onUpdateStatus }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const toast = useToast();
  
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  const handleUpdateStatus = async (newStatus) => {
    try {
      setIsUpdating(true);
      await onUpdateStatus(task._id, newStatus);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update task status',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    try {
      await onDelete(task._id);
      toast({
        title: 'Task deleted',
        status: 'success',
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete task',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'gray';
      case 'in-progress':
        return 'blue';
      case 'completed':
        return 'green';
      default:
        return 'gray';
    }
  };
  
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low':
        return 'green';
      case 'medium':
        return 'orange';
      case 'high':
        return 'red';
      default:
        return 'gray';
    }
  };
  
  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      borderColor={borderColor}
      bg={bgColor}
      p={4}
      mb={4}
      position="relative"
      transition="all 0.2s ease"
      _hover={{ 
        transform: 'translateY(-2px)', 
        boxShadow: 'md',
        borderColor: useColorModeValue('gray.300', 'gray.500')
      }}
    >
      <Flex alignItems="flex-start" justifyContent="space-between">
        <Box flex="1">
          <HStack mb={2} spacing={3} align="center">
            <Checkbox
              isChecked={task.status === 'completed'}
              onChange={() => handleUpdateStatus(task.status === 'completed' ? 'pending' : 'completed')}
              colorScheme="green"
              isDisabled={isUpdating}
            />
            <Text
              fontSize="lg" 
              fontWeight="semibold"
              textDecoration={task.status === 'completed' ? 'line-through' : 'none'}
              color={task.status === 'completed' ? 'gray.500' : useColorModeValue('gray.700', 'white')}
            >
              {task.title}
            </Text>
          </HStack>
          
          {task.description && (
            <Text 
              color={useColorModeValue('gray.600', 'gray.300')} 
              ml={8} 
              mb={3} 
              fontSize="sm"
              noOfLines={2}
            >
              {task.description}
            </Text>
          )}
          
          <HStack ml={8} spacing={3}>
            <Badge colorScheme={getStatusColor(task.status)}>
              {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
            </Badge>
            <Badge colorScheme={getPriorityColor(task.priority)}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
            </Badge>
            
            {task.dueDate && (
              <Tooltip label={format(new Date(task.dueDate), 'PPP')} placement="top">
                <Flex alignItems="center" fontSize="xs" color="gray.500">
                  <Box as={FiClock} mr={1} />
                  {format(new Date(task.dueDate), 'MMM d')}
                </Flex>
              </Tooltip>
            )}
          </HStack>
        </Box>
        
        <Box>
          <Menu>
            <MenuButton
              as={IconButton}
              aria-label="Options"
              icon={<FiMoreVertical />}
              variant="ghost"
              size="sm"
            />
            <MenuList>
              <MenuItem 
                icon={<FiEdit2 />} 
                onClick={() => onEdit(task)}
              >
                Edit
              </MenuItem>
              
              {task.status !== 'in-progress' && (
                <MenuItem 
                  icon={<FiClock />} 
                  onClick={() => handleUpdateStatus('in-progress')}
                >
                  Mark as In Progress
                </MenuItem>
              )}
              
              {task.status !== 'completed' && (
                <MenuItem 
                  icon={<FiCheckCircle />} 
                  onClick={() => handleUpdateStatus('completed')}
                >
                  Mark as Completed
                </MenuItem>
              )}
              
              <MenuItem 
                icon={<FiTrash2 />} 
                onClick={handleDelete}
                color="red.500"
              >
                Delete
              </MenuItem>
            </MenuList>
          </Menu>
        </Box>
      </Flex>
    </Box>
  );
};

export default TaskItem; 