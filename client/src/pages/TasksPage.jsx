import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  Button,
  HStack,
  VStack,
  InputGroup,
  Input,
  InputRightElement,
  Select,
  Divider,
  SimpleGrid,
  Badge,
  Flex,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useColorModeValue,
  IconButton,
  Tag,
  Skeleton,
} from '@chakra-ui/react';
import { FiPlus, FiFilter, FiSearch, FiX } from 'react-icons/fi';
import Layout from '../components/Layout';
import TaskItem from '../components/TaskItem';
import TaskForm from '../components/TaskForm';
import useTasks from '../hooks/useTasks';

const TasksPage = () => {
  const { 
    tasks, 
    loading, 
    error, 
    filters, 
    updateFilters, 
    createTask, 
    updateTask, 
    deleteTask, 
    updateTaskStatus 
  } = useTasks();
  
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const navigate = useNavigate();
  const location = useLocation();

  // Apply URL search params to filters
  useEffect(() => {
    const status = searchParams.get('status') || '';
    const priority = searchParams.get('priority') || '';
    const search = searchParams.get('search') || '';
    
    updateFilters({ status, priority, search });
    setSearchInput(search);
  }, [searchParams, updateFilters]);

  // Handle search input
  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams({ 
      ...Object.fromEntries(searchParams.entries()),
      search: searchInput 
    });
  };

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    const params = { ...Object.fromEntries(searchParams.entries()) };
    if (value) {
      params[field] = value;
    } else {
      delete params[field];
    }
    setSearchParams(params);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchParams({});
    setSearchInput('');
  };

  // Handle create task
  const handleCreateTask = async (data) => {
    try {
      setIsSubmitting(true);
      const result = await createTask(data);
      if (result.success) {
        onCreateClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit task
  const handleEditTask = async (data) => {
    try {
      setIsSubmitting(true);
      const result = await updateTask(selectedTask._id, data);
      if (result.success) {
        setSelectedTask(null);
        onEditClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open edit modal
  const openEditModal = (task) => {
    setSelectedTask(task);
    onEditOpen();
  };

  // Check if filters are active
  const hasActiveFilters = filters.status || filters.priority || filters.search;

  return (
    <Layout>
      <Box mb={8}>
        <Flex 
          justifyContent="space-between" 
          alignItems={{ base: 'start', md: 'center' }} 
          flexDirection={{ base: 'column', md: 'row' }}
          mb={4}
          gap={4}
        >
          <Box>
            <Heading size="xl" mb={1}>Tasks</Heading>
            <Text color="gray.500">Manage and organize your tasks</Text>
          </Box>
          <Button leftIcon={<FiPlus />} colorScheme="blue" onClick={onCreateOpen}>
            Create Task
          </Button>
        </Flex>
        
        {/* Filters */}
        <Box 
          p={4} 
          bg={useColorModeValue('white', 'gray.700')} 
          borderRadius="lg" 
          shadow="sm"
          borderWidth="1px"
          borderColor={useColorModeValue('gray.200', 'gray.600')}
        >
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} alignItems="end">
            <Box>
              <form onSubmit={handleSearch}>
                <InputGroup>
                  <Input
                    placeholder="Search tasks..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                  <InputRightElement>
                    <IconButton
                      icon={<FiSearch />}
                      variant="ghost"
                      aria-label="Search"
                      type="submit"
                    />
                  </InputRightElement>
                </InputGroup>
              </form>
            </Box>
            
            <Select
              placeholder="Filter by Status"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </Select>
            
            <Select
              placeholder="Filter by Priority"
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Select>
          </SimpleGrid>
          
          {hasActiveFilters && (
            <HStack mt={4} spacing={2} flexWrap="wrap">
              <Text fontSize="sm">Active filters:</Text>
              {filters.status && (
                <Tag size="sm" colorScheme="blue" borderRadius="full">
                  Status: {filters.status}
                  <Box 
                    as="span" 
                    ml={1} 
                    cursor="pointer" 
                    onClick={() => handleFilterChange('status', '')}
                  >
                    ✕
                  </Box>
                </Tag>
              )}
              {filters.priority && (
                <Tag size="sm" colorScheme="orange" borderRadius="full">
                  Priority: {filters.priority}
                  <Box 
                    as="span" 
                    ml={1} 
                    cursor="pointer" 
                    onClick={() => handleFilterChange('priority', '')}
                  >
                    ✕
                  </Box>
                </Tag>
              )}
              {filters.search && (
                <Tag size="sm" colorScheme="green" borderRadius="full">
                  Search: {filters.search}
                  <Box 
                    as="span" 
                    ml={1} 
                    cursor="pointer" 
                    onClick={() => handleFilterChange('search', '')}
                  >
                    ✕
                  </Box>
                </Tag>
              )}
              <Button size="xs" leftIcon={<FiX />} onClick={clearFilters}>
                Clear all
              </Button>
            </HStack>
          )}
        </Box>
      </Box>
      
      {/* Task List */}
      <Box>
        {loading ? (
          <VStack spacing={4} align="stretch">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} height="100px" borderRadius="md" />
            ))}
          </VStack>
        ) : error ? (
          <Text color="red.500">{error}</Text>
        ) : tasks.length === 0 ? (
          <Box 
            textAlign="center" 
            py={10} 
            bg={useColorModeValue('white', 'gray.700')}
            borderRadius="lg"
            shadow="sm"
          >
            <Heading size="md" mb={2}>No tasks found</Heading>
            <Text mb={6}>
              {hasActiveFilters 
                ? 'Try adjusting your filters to see more results.' 
                : "You don't have any tasks yet."}
            </Text>
            {!hasActiveFilters && (
              <Button leftIcon={<FiPlus />} colorScheme="blue" onClick={onCreateOpen}>
                Create your first task
              </Button>
            )}
          </Box>
        ) : (
          <VStack spacing={4} align="stretch">
            {tasks.map(task => (
              <TaskItem
                key={task._id}
                task={task}
                onUpdateStatus={updateTaskStatus}
                onDelete={deleteTask}
                onEdit={openEditModal}
              />
            ))}
          </VStack>
        )}
      </Box>
      
      {/* Create Task Modal */}
      <Modal isOpen={isCreateOpen} onClose={onCreateClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Task</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <TaskForm 
              onSubmit={handleCreateTask} 
              isSubmitting={isSubmitting} 
              onCancel={onCreateClose}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
      
      {/* Edit Task Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Task</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedTask && (
              <TaskForm 
                task={selectedTask} 
                onSubmit={handleEditTask} 
                isSubmitting={isSubmitting} 
                onCancel={onEditClose}
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Layout>
  );
};

export default TasksPage; 