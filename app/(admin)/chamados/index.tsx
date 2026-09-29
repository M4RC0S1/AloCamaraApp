import { FlatList, StyleSheet, Text, View } from 'react-native';

export default function ChamadosAdmin() {
  const chamados = [{ id: '1', titulo: 'Buraco na rua', cidadao: 'João Silva', status: 'Pendente' }];

  return (
    <View style={styles.container}>
      <FlatList
        data={chamados}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.titulo}</Text>
            <Text style={styles.cardUser}>Cidadão: {item.cidadao}</Text>
            <Text style={styles.status}>Status: {item.status}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5', padding: 16 },
  card: { backgroundColor: '#FFF', padding: 16, borderRadius: 8, elevation: 2, marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: 'bold' },
  cardUser: { fontSize: 14, color: '#666', marginTop: 4 },
  status: { color: '#0056b3', fontWeight: 'bold', marginTop: 8 }
});