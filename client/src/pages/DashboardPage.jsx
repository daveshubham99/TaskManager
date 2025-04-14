import { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Heading,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  HStack,
  Icon,
  useColorModeValue,
  Divider,
  VStack,
  Skeleton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import { FiCheckCircle, FiClock, FiAlertTriangle, FiList, FiPlus } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import useTasks from '../hooks/useTasks';
import TaskItem from '../components/TaskItem';
import TaskForm from '../components/TaskForm';

const DashboardPage = () => {
  const { tasks, loading, error, createTask, updateTaskStatus, deleteTask, fetchTasks } = useTasks();
  const [taskStats, setTaskStats] = useState({ pending: 0, inProgress: 0, completed: 0, highPriority: 0 });
  const [recentTasks, setRecentTasks] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Calculate task statistics and get recent tasks
  useEffect(() => {
    if (tasks.length > 0) {
      const stats = {
        pending: tasks.filter(task => task.status === 'pending').length,
        inProgress: tasks.filter(task => task.status === 'in-progress').length,
        completed: tasks.filter(task => task.status === 'completed').length,
        highPriority: tasks.filter(task => task.priority === 'high' && task.status !== 'completed').length,
      };
      setTaskStats(stats);
      
      // Get 5 most recent tasks
      const sorted = [...tasks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRecentTasks(sorted.slice(0, 5));
    }
  }, [tasks]);
  
  const handleCreateTask = async (data) => {
    try {
      setIsSubmitting(true);
      const result = await createTask(data);
      if (result.success) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const statCardProps = {
    p: 5,
    borderWidth: '1px',
    borderRadius: 'lg',
    shadow: 'sm',
    bg: cardBg,
    borderColor: borderColor,
    transition: 'all 0.3s',
    _hover: { transform: 'translateY(-3px)', shadow: 'md' },
  };

  return (
    <Layout>
      <Box mb={8}>
        <Heading size="xl" mb={2}>Dashboard</Heading>
        <Text color="gray.500">Welcome to your task management dashboard</Text>
      </Box>
      
      {/* Task Statistics */}
      <StatGroup mb={8}>
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4} width="100%">
          <Box {...statCardProps}>
            <Stat>
              <HStack spacing={4}>
                <Icon as={FiClock} boxSize={10} color="blue.400" />
                <Box>
                  <StatLabel fontSize="lg">Pending</StatLabel>
                  <StatNumber>{loading ? <Skeleton height="1.5rem" width="3rem" /> : taskStats.pending}</StatNumber>
                </Box>
              </HStack>
            </Stat>
          </Box>

          <Box {...statCardProps}>
            <Stat>
              <HStack spacing={4}>
                <Icon as={FiList} boxSize={10} color="orange.400" />
                <Box>
                  <StatLabel fontSize="lg">In Progress</StatLabel>
                  <StatNumber>{loading ? <Skeleton height="1.5rem" width="3rem" /> : taskStats.inProgress}</StatNumber>
                </Box>
              </HStack>
            </Stat>
          </Box>

          <Box {...statCardProps}>
            <Stat>
              <HStack spacing={4}>
                <Icon as={FiCheckCircle} boxSize={10} color="green.400" />
                <Box>
                  <StatLabel fontSize="lg">Completed</StatLabel>
                  <StatNumber>{loading ? <Skeleton height="1.5rem" width="3rem" /> : taskStats.completed}</StatNumber>
                </Box>
              </HStack>
            </Stat>
          </Box>

          <Box {...statCardProps}>
            <Stat>
              <HStack spacing={4}>
                <Icon as={FiAlertTriangle} boxSize={10} color="red.400" />
                <Box>
                  <StatLabel fontSize="lg">High Priority</StatLabel>
                  <StatNumber>{loading ? <Skeleton height="1.5rem" width="3rem" /> : taskStats.highPriority}</StatNumber>
                </Box>
              </HStack>
            </Stat>
          </Box>
        </SimpleGrid>
      </StatGroup>

      {/* Recent Tasks & Quick Add */}
      <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={8}>
        <Box>
          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px" mb={4}>
            <CardHeader pb={0}>
              <Heading size="md">Recent Tasks</Heading>
            </CardHeader>
            <CardBody>
              {loading ? (
                <VStack spacing={4} align="stretch">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} height="100px" borderRadius="md" />
                  ))}
                </VStack>
              ) : error ? (
                <Text color="red.500">{error}</Text>
              ) : recentTasks.length === 0 ? (
                <Text py={4}>No tasks yet. Create your first task to get started.</Text>
              ) : (
                <VStack spacing={3} align="stretch">
                  {recentTasks.map(task => (
                    <TaskItem
                      key={task._id}
                      task={task}
                      onUpdateStatus={updateTaskStatus}
                      onDelete={deleteTask}
                      onEdit={() => navigate(`/tasks/${task._id}`)}
                    />
                  ))}
                </VStack>
              )}
            </CardBody>
            <Divider />
            <CardFooter>
              <Button 
                leftIcon={<FiList />} 
                colorScheme="blue" 
                variant="outline"
                onClick={() => navigate('/tasks')}
              >
                View All Tasks
              </Button>
            </CardFooter>
          </Card>
        </Box>
        
        <Box>
          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
            <CardHeader pb={0}>
              <Heading size="md">Quick Actions</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Button 
                  leftIcon={<FiPlus />} 
                  colorScheme="blue" 
                  size="lg" 
                  onClick={onOpen} 
                  isFullWidth
                >
                  Create New Task
                </Button>
                <Button 
                  leftIcon={<FiAlertTriangle />} 
                  colorScheme="red" 
                  variant="outline" 
                  size="lg"
                  onClick={() => navigate('/tasks?priority=high')}
                  isFullWidth
                >
                  View High Priority
                </Button>
                <Button 
                  leftIcon={<FiClock />} 
                  colorScheme="orange" 
                  variant="outline" 
                  size="lg"
                  onClick={() => navigate('/tasks?status=in-progress')}
                  isFullWidth
                >
                  In Progress Tasks
                </Button>
              </VStack>
            </CardBody>
          </Card>
        </Box>
      </Grid>

      {/* Add Task Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Task</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <TaskForm onSubmit={handleCreateTask} isSubmitting={isSubmitting} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Layout>
  );
};

export default DashboardPage; 