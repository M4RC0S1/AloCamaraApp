import { useRouter, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppIcon } from '@/components/AppIcon';
import { DARK, LIGHT } from '@/constants/app-theme';
import { useApp } from '@/context/AppContext';

const people: Record<string, { name: string; party: string; region: string; rating: string }> = {
  '1': { name: 'Maria Silva Santos', party: 'Partido A', region: 'Centro', rating: '4.8' },
  '2': { name: 'João Pedro Costa', party: 'Partido B', region: 'Norte', rating: '4.5' },
  '3': { name: 'Ana Carolina Lima', party: 'Partido C', region: 'Sul', rating: '4.9' },
  '4': { name: 'Carlos Alberto Souza', party: 'Partido D', region: 'Leste', rating: '4.6' },
  '5': { name: 'Beatriz Oliveira', party: 'Partido E', region: 'Oeste', rating: '4.7' },
};

export default function Detalhe() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { dark } = useApp();
  const C = dark ? DARK : LIGHT;
  const person = people[id || '1'] || people['1'];

  return <SafeAreaView edges={['top']} style={[styles.root, { backgroundColor: C.bg }]}>
    <View style={[styles.header, { backgroundColor: C.surface, borderBottomColor: C.line }]}><TouchableOpacity onPress={() => router.back()} style={styles.back}><AppIcon name="arrow-left" size={25} color={C.text} /></TouchableOpacity><Text style={[styles.headerTitle, { color: C.text }]}>{person.name}</Text></View>
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.profile}><View style={styles.bigAvatar}><Text style={styles.bigLetter}>{person.name[0]}</Text></View><Text style={[styles.name, { color: C.text }]}>{person.name}</Text><Text style={[styles.meta, { color: C.muted }]}>{person.party}</Text><Text style={[styles.meta, { color: C.muted }]}>{person.region}</Text></View>
      <View style={styles.stats}><Stat icon="star" value={person.rating} label="Nota" C={C} /><Stat value="128" label="Avaliações" C={C} /><Stat value="342" label="Demandas" C={C} /></View>
      <View style={[styles.response, { backgroundColor: C.surface }]}><Text style={[styles.responseText, { color: C.text }]}>95% · Taxa de Resposta</Text></View>
      <Info C={C} title="Sobre">Vereador atuante há vários anos, com foco em desenvolvimento urbano, saúde pública e educação. Atua diretamente em projetos sociais do município.</Info>
      <Info C={C} title="Contato">vereador@camara.gov.br{`\n`}(44) 99999-9999</Info>
      <Text style={[styles.actionsTitle, { color: C.text }]}>Ações</Text>
      <View style={styles.actions}>{[['Solicitação', 'alert-circle-outline', C.blue], ['Reclamação', 'message-alert-outline', C.orange], ['Elogio', 'heart-outline', '#D946A8'], ['Agendar Reunião', 'calendar-clock', C.green], ['Comunicados', 'bullhorn-outline', C.cyan]].map(([label, icon, color]) => <TouchableOpacity key={String(label)} style={[styles.action, { borderColor: String(color) }]} onPress={() => router.push('/(user)/chamados/novo' as any)}><AppIcon name={icon as any} size={16} color={String(color)} /><Text style={[styles.actionText, { color: String(color) }]}>{String(label)}</Text></TouchableOpacity>)}</View>
    </ScrollView>
  </SafeAreaView>;
}
function Stat({ icon, value, label, C }: { icon?: any; value: string; label: string; C: typeof DARK | typeof LIGHT }) { return <View style={[styles.stat, { backgroundColor: C.surface }]}>{icon && <AppIcon name={icon} size={17} color={C.yellow} />}<Text style={[styles.value, { color: C.text }]}>{value}</Text><Text style={[styles.label, { color: C.muted }]}>{label}</Text></View>; }
function Info({ title, children, C }: { title: string; children: string; C: typeof DARK | typeof LIGHT }) { return <View style={[styles.info, { backgroundColor: C.surface }]}><Text style={[styles.infoTitle, { color: C.text }]}>{title}</Text><Text style={[styles.infoText, { color: C.muted }]}>{children}</Text></View>; }
const styles = StyleSheet.create({ root: { flex: 1 }, header: { height: 58, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, borderBottomWidth: 1 }, back: { width: 42, height: 42, justifyContent: 'center', alignItems: 'center' }, headerTitle: { flex: 1, fontSize: 22, fontWeight: '700' }, content: { padding: 16, paddingBottom: 36 }, profile: { alignItems: 'center', paddingVertical: 18 }, bigAvatar: { width: 124, height: 124, borderRadius: 62, backgroundColor: '#202F68', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }, bigLetter: { fontSize: 48, color: '#fff' }, name: { fontSize: 23, fontWeight: '800' }, meta: { fontSize: 15, marginTop: 3 }, stats: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }, stat: { width: '31%', borderRadius: 15, paddingVertical: 13, alignItems: 'center' }, value: { fontSize: 17, fontWeight: '800', marginTop: 2 }, label: { fontSize: 12, marginTop: 3 }, response: { borderRadius: 15, padding: 16, marginBottom: 16 }, responseText: { fontSize: 15, fontWeight: '700' }, info: { borderRadius: 17, padding: 16, marginBottom: 16 }, infoTitle: { fontSize: 15, fontWeight: '800', marginBottom: 8 }, infoText: { fontSize: 14, lineHeight: 20 }, actionsTitle: { fontSize: 18, fontWeight: '800', marginBottom: 12 }, actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 }, action: { borderWidth: 1, borderRadius: 11, paddingHorizontal: 12, paddingVertical: 9, flexDirection: 'row', alignItems: 'center' }, actionText: { fontSize: 12, fontWeight: '700', marginLeft: 5 } });
