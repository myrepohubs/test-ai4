import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, FlatList, 
  Modal, SafeAreaView, StatusBar, Alert, Platform 
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { 
  CheckCircle2, Plus, Trash2, Calendar, 
  LayoutList, X, Filter 
} from 'lucide-react-native';
import { format } from 'date-fns';
import { styled } from 'nativewind';
import { API_URL } from './constants/config';

// --- TYPES ---
interface Todo {
  todo_id: number;
  title: string;
  description: string;
  priority: "High" | "Medium" | "Low";
  project: string;
  due_date: string;
  is_completed: boolean;
}

const INITIAL_FORM = {
  title: "",
  description: "",
  priority: "Medium",
  project: "General",
  due_date: new Date().toISOString().split('T')[0]
};

// --- COMPONENTS ---

// Custom Checkbox since RN doesn't have a default one
const Checkbox = ({ checked, onPress }: { checked: boolean; onPress: () => void }) => (
  <TouchableOpacity onPress={onPress} className={`w-6 h-6 rounded border items-center justify-center mr-3 ${checked ? 'bg-blue-600 border-blue-600' : 'border-gray-500'}`}>
    {checked && <CheckCircle2 size={14} color="white" />}
  </TouchableOpacity>
);

const PriorityBadge = ({ level }: { level: string }) => {
  let styles = "bg-gray-800 text-gray-400 border-gray-700";
  if (level === "High") styles = "bg-red-900/30 border-red-800";
  if (level === "Medium") styles = "bg-orange-900/30 border-orange-800";
  if (level === "Low") styles = "bg-green-900/30 border-green-800";
  
  let textStyle = "text-gray-400";
  if (level === "High") textStyle = "text-red-400";
  if (level === "Medium") textStyle = "text-orange-400";
  if (level === "Low") textStyle = "text-green-400";

  return (
    <View className={`px-2 py-1 rounded-full border ${styles} self-start`}>
      <Text className={`text-xs font-bold ${textStyle}`}>{level}</Text>
    </View>
  );
};

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // 1. FETCH TASKS
  const fetchTodos = async () => {
    try {
      console.log("Fetching from:", API_URL + "/todos");
      const res = await fetch(`${API_URL}/todos`);
      const data = await res.json();
      setTodos(data);
    } catch (err) {
      console.error("Connection Error:", err);
      Alert.alert("Error", "Could not connect to server. Ensure backend is running.");
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  // 2. SUBMIT FORM
  const handleSubmit = async () => {
    const url = `${API_URL}/todos`;
    const method = isEditing && selectedId ? "PUT" : "POST";
    const endpoint = isEditing && selectedId ? `${url}/${selectedId}` : url;

    try {
      await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      fetchTodos();
      closeModal();
    } catch (err) {
      console.error(err);
    }
  };

  // 3. TOGGLE COMPLETE
  const toggleComplete = async (id: number, status: boolean) => {
    try {
      await fetch(`${API_URL}/todos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_completed: !status }),
      });
      fetchTodos();
    } catch (err) {
      console.error(err);
    }
  };

  // 4. DELETE
  const handleDelete = async (id: number) => {
    try {
      await fetch(`${API_URL}/todos/${id}`, { method: "DELETE" });
      fetchTodos();
      closeModal();
    } catch (err) {
      console.error(err);
    }
  };

  const openEdit = (todo: Todo) => {
    setFormData({
      title: todo.title,
      description: todo.description || "",
      priority: todo.priority,
      project: todo.project || "General",
      due_date: todo.due_date ? todo.due_date.split('T')[0] : new Date().toISOString().split('T')[0]
    });
    setSelectedId(todo.todo_id);
    setIsEditing(true);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setFormData(INITIAL_FORM);
    setIsEditing(false);
    setSelectedId(null);
  };

  const renderItem = ({ item }: { item: Todo }) => (
    <TouchableOpacity 
      onPress={() => openEdit(item)}
      className="bg-[#171A21] p-4 mb-3 rounded-xl border border-gray-800 flex-row items-start"
    >
      <Checkbox checked={item.is_completed} onPress={() => toggleComplete(item.todo_id, item.is_completed)} />
      
      <View className="flex-1">
        <View className="flex-row justify-between items-start mb-1">
          <Text className={`text-base font-semibold ${item.is_completed ? 'text-gray-600 line-through' : 'text-gray-200'}`}>
            {item.title}
          </Text>
        </View>
        
        <Text numberOfLines={2} className="text-gray-500 text-sm mb-2">{item.description}</Text>
        
        <View className="flex-row items-center space-x-3">
          <PriorityBadge level={item.priority} />
          <View className="flex-row items-center">
            <Calendar size={12} color="#6B7280" />
            <Text className="text-gray-500 text-xs ml-1">
              {item.due_date ? format(new Date(item.due_date), "MMM dd") : "-"}
            </Text>
          </View>
          <Text className="text-gray-600 text-xs">| {item.project}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#0F1115] pt-8">
      <ExpoStatusBar style="light" />
      
      {/* HEADER */}
      <View className="px-5 py-4 border-b border-gray-800 flex-row justify-between items-center">
        <View>
          <Text className="text-2xl font-bold text-white">My Tasks</Text>
          <Text className="text-gray-500">{format(new Date(), "EEEE, MMMM do")}</Text>
        </View>
        <TouchableOpacity onPress={() => { closeModal(); setModalVisible(true); }} className="bg-blue-600 p-3 rounded-full">
          <Plus color="white" size={24} />
        </TouchableOpacity>
      </View>

      {/* LIST */}
      <FlatList
        data={todos}
        keyExtractor={(item) => item.todo_id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 20 }}
        ListEmptyComponent={
          <Text className="text-gray-500 text-center mt-10">No tasks found. Add one!</Text>
        }
      />

      {/* MODAL (Add/Edit) */}
      <Modal animationType="slide" visible={modalVisible} presentationStyle="pageSheet">
        <View className="flex-1 bg-[#13151A] p-5">
          <View className="flex-row justify-between items-center mb-8 mt-4">
            <Text className="text-xl font-bold text-white">{isEditing ? 'Edit Task' : 'New Task'}</Text>
            <TouchableOpacity onPress={closeModal}>
              <X color="#9CA3AF" size={24} />
            </TouchableOpacity>
          </View>

          <View className="space-y-4">
            <View>
              <Text className="text-gray-500 text-xs uppercase font-bold mb-1">Title</Text>
              <TextInput 
                value={formData.title}
                onChangeText={(text) => setFormData({...formData, title: text})}
                className="bg-[#1D2129] text-white p-4 rounded-lg border border-gray-700"
                placeholder="What needs to be done?"
                placeholderTextColor="#4B5563"
              />
            </View>

            <View>
              <Text className="text-gray-500 text-xs uppercase font-bold mb-1">Description</Text>
              <TextInput 
                value={formData.description}
                onChangeText={(text) => setFormData({...formData, description: text})}
                className="bg-[#1D2129] text-white p-4 rounded-lg border border-gray-700"
                placeholder="Add details..."
                placeholderTextColor="#4B5563"
                multiline
                numberOfLines={3}
              />
            </View>

            <View className="flex-row space-x-4">
              <View className="flex-1">
                <Text className="text-gray-500 text-xs uppercase font-bold mb-1">Priority</Text>
                {/* Simple Select Mockup */}
                <View className="flex-row bg-[#1D2129] rounded-lg border border-gray-700 p-1">
                  {["High", "Medium", "Low"].map((p) => (
                    <TouchableOpacity 
                      key={p} 
                      onPress={() => setFormData({...formData, priority: p as any})}
                      className={`flex-1 items-center py-2 rounded ${formData.priority === p ? 'bg-blue-600' : ''}`}
                    >
                      <Text className={formData.priority === p ? 'text-white font-bold' : 'text-gray-500'}>{p}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View>
              <Text className="text-gray-500 text-xs uppercase font-bold mb-1">Project</Text>
              <TextInput 
                value={formData.project}
                onChangeText={(text) => setFormData({...formData, project: text})}
                className="bg-[#1D2129] text-white p-4 rounded-lg border border-gray-700"
              />
            </View>

            <TouchableOpacity onPress={handleSubmit} className="bg-blue-600 py-4 rounded-lg items-center mt-4">
              <Text className="text-white font-bold text-lg">{isEditing ? 'Save Changes' : 'Create Task'}</Text>
            </TouchableOpacity>

            {isEditing && (
              <TouchableOpacity onPress={() => handleDelete(selectedId!)} className="bg-red-900/20 py-4 rounded-lg items-center border border-red-900">
                <Text className="text-red-500 font-bold">Delete Task</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
