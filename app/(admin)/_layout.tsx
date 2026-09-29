import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack screenOptions={{ 
      headerStyle: { backgroundColor: '#0056b3' },
      headerTintColor: '#FFFFFF'
    }}>
      <Stack.Screen name="chamados/index" options={{ title: 'Painel da Prefeitura' }} />
    </Stack>
  );
}