import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import 'react-native-get-random-values';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from 'moment';

import { Task } from '../types';
import { getAllTasks, removeTask } from '../storage/TasksStorage';
import { deleteTask } from '../utils/TaskManager';
import { useCurrentSemester } from '../hooks/CurrentSemesterContext';
import { getAllCourses } from '../storage/CoursesStorage';

import SearchBar from '../components/SearchBars';

interface TasksScreenProps {
  navigation: any;
}

const TasksScreen: React.FC<TasksScreenProps> = ({ navigation }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { currentSemesterId } = useCurrentSemester();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedTasks, setSelectedTasks] = useState(null);

  const fetchTasks = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // get tasks by semester id
      const fetchedTasks = await getAllTasks();
      const courses = await getAllCourses();
      const currentSemesterCourseIds = courses?.filter(course => course.semesterId === currentSemesterId).map(course => course.id) ?? [];
      const currentSemesterTasks = fetchedTasks?.filter(task => currentSemesterCourseIds.includes(task.courseId)) ?? [];

      setTasks(currentSemesterTasks);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [currentSemesterId]);

  useFocusEffect(
    React.useCallback(() => {
      fetchTasks();
    }, [fetchTasks])
  );

  const handleItemPress = (item: Task) => {
    navigation.navigate('Task Details', { item });
  };

  const handleDeletePress = async (item: Task) => {
    Alert.alert(
      'Delete Task',
      'Are you sure to delete this task?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: async () => {
            // await removeTask(item.id);
            await deleteTask(item);
            fetchTasks();
          },
        },
      ]
    );
  };

  const handleSearch = (searchQuery, tasks) => {
    setSelectedTasks(tasks.filter(task => task.name.includes(searchQuery.trim())));
  };

  useEffect(() => {
    setSelectedTasks(tasks);
  }, [isLoading, error]);

  return (
    <View style={styles.container}>
      {isLoading && <Text>Loading tasks...</Text>}
      {error && <Text style={styles.errorText}>Error loading tasks: {error}</Text>}
      <SearchBar
        onSearch={(searchQuery) => handleSearch(searchQuery,tasks)}
      />
      {!isLoading && !error && (
        <FlatList
          contentContainerStyle={styles.listContent}
          data={selectedTasks}
          renderItem={({ item }) => (
            <View style={styles.itemBlock}>
              <TouchableOpacity onPress={() => handleItemPress(item)}>
                <View>
                  <Text style={styles.itemTitle}>{item.name}</Text>
                  <Text style={styles.itemDue}>Due: {moment(item.dueDate).format('HH:mm:ss DD/MM/YYYY')}</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDeletePress(item)}>
                <Icon name="delete" size={25} />
              </TouchableOpacity>
            </View>
          )}
          keyExtractor={item => item.name}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorText: {
    color: 'red',
  },
  listContent: {
    paddingBottom: 70,
  },
  itemBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 5,
    marginTop: 20,
    marginHorizontal: 20,
    padding: 10,
  },
  itemTitle: {
    fontSize: 20,
    color: 'black',
    fontWeight: 'bold',
  },
  itemDue: {
    fontSize: 16,
    color: 'blue',
    margin: 2,
  },
});

export default TasksScreen;
