import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import FormTemplate from '../components/FormTemplate';
import { ClassPeriod, Course } from '../types';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { addInstance } from '../storage/Storage';

const AddCourseScreen = ({ route, navigation }) => {
  const { setCourses } = route.params;
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [credits, setCredits] = useState('');
  const [location, setLocation] = useState('');
  const [day, setDay] = useState('Monday');
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());

  const fields = [
    {
      label: 'Course Name',
      placeholder: 'Enter course name',
      value: name,
      onChangeText: setName,
    },
    {
      label: 'Course Code',
      placeholder: 'Enter course code',
      value: code,
      onChangeText: setCode,
    },
    {
      label: 'Credits',
      placeholder: 'Enter number of credits',
      value: credits,
      onChangeText: setCredits,
    },
    {
      label: 'Location',
      placeholder: 'Enter course location',
      value: location,
      onChangeText: setLocation,
    },
    {
      label: 'Day',
      placeholder: 'Select day',
      value: day,
      isPicker: true,
      pickerItems: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      onChangeText: setDay,
    },
    {
      label: 'Start Time',
      value: startTime,
      isDatePicker: true,
      onDateChange: setStartTime,
    },
    {
      label: 'End Time',
      value: endTime,
      isDatePicker: true,
      onDateChange: setEndTime,
    },
  ];

  const resetState = () => {
    setName('');
    setCode('');
    setCredits('');
    setLocation('');
  };

  const handleSubmit = async () => {
    if (!name || name.length > 100) {
      Alert.alert('Invalid input', 'Please enter a valid course name (1-100 characters).');
      return;
    }

    if (!code || code.length > 100) {
      Alert.alert('Invalid input', 'Please enter a valid course code (1-100 characters).');
      return;
    }

    const numCredits = parseInt(credits, 10);
    if (isNaN(numCredits) || numCredits <= 0) {
      Alert.alert('Invalid input', 'Please enter a valid number of credits (greater than 0).');
      return;
    }

    if (!location) {
      Alert.alert('Invalid input', 'Please enter a location.');
      return;
    }

    if (startTime >= endTime) {
      Alert.alert('Invalid input', 'Start time must be earlier than end time.');
      return;
    }

    const newCourse: Course = {
      id: uuidv4(),
      name,
      code,
      credits: parseInt(credits, 10),
      location,
      schedule: [{ day, startTime, endTime } as ClassPeriod],
    };

    await addInstance('course', newCourse);

    setCourses((prevCourses: Course[]) => [...prevCourses, newCourse]);

    resetState();

    Alert.alert(
      'Success',
      'Course was added successfully',
      [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]
    );
  };

  return (
    <View>
      <FormTemplate fields={fields} onSubmit={handleSubmit} />
    </View>
  );
};

export default AddCourseScreen;
