import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { PawPrint, Dog, Cat, Search, User } from 'lucide-react';

type PetEntry = {
  id: string;
  name: string;
  breed: string;
  age: string | number;
  size?: string;
  type: string;
  photoUrl?: string;
  ownerName: string;
  ownerEmail: string;
  source: 'client' | 'booking';
};

export default function PetsPanel() {
  const [pets, setPets] = useState<PetEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      const seen = new Set<string>();
      const result: PetEntry[] = [];

      // 1. Read from clients collection (primary source — has photos)
      try {
        const clientSnap = await getDocs(collection(db, 'clients'));
        clientSnap.docs.forEach(d => {
          const client = d.data() as any;
          (client.pets || []).forEach((pet: any) => {
            const key = `${client.email}-${pet.name}`;
            if (!seen.has(key)) {
              seen.add(key);
              result.push({
                id: pet.id || key,
                name: pet.name || '—',
                breed: pet.breed || '—',
                age: pet.age ?? '—',
                size: pet.size,
                type: pet.type || 'dog',
                photoUrl: pet.photoUrl,
                ownerName: client.name || '—',
                ownerEmail: client.email || '—',
                source: 'client',
              });
            }
          });
        });
      } catch (e) {
        console.warn('[PetsPanel] clients read failed:', e);
      }

      // 2. Supplement with bookings (catches pets from clients not yet upserted)
      try {
        const bookingSnap = await getDocs(collection(db, 'bookings'));
        bookingSnap.docs.forEach(d => {
          const b = d.data() as any;
          const email = b.contact?.email || '';
          const ownerName = b.contact?.name || '—';
          (b.details || []).forEach((pet: any) => {
            const key = `${email}-${pet.name}`;
            if (!seen.has(key) && pet.name) {
              seen.add(key);
              result.push({
                id: key,
                name: pet.name,
                breed: pet.breed || '—',
                age: pet.age ?? '—',
                size: b.sizes?.[0],
                type: String(b.serviceId).toLowerCase().includes('feline') ? 'cat' : 'dog',
                ownerName,
                ownerEmail: email,
                source: 'booking',
              });
            }
          });
        });
      } catch (e) {
        console.warn('[PetsPanel] bookings read failed:', e);
      }

      setPets(result.sort((a, b) => a.name.localeCompare(b.name)));
      setLoading(false);
    }
    load();
  }, []);

  const filtered = pets.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.ownerName.toLowerCase().includes(search.toLowerCase()) ||
    p.ownerEmail.toLowerCase().includes(search.toLowerCase()) ||
    p.breed.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Animaux</h1>
          <p className="text-sm text-gray-500 mt-1">{pets.length} animal{pets.length !== 1 ? 'aux' : ''} enregistré{pets.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center">
          <PawPrint className="mx-auto text-gray-300 mb-3" size={48} />
          <p className="text-gray-500 font-medium">Aucun animal trouvé.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(pet => (
            <div key={pet.id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition overflow-hidden">
              {/* Avatar */}
              <div className="flex items-center gap-4 p-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-blue-50 border-2 border-blue-100 flex items-center justify-center flex-shrink-0">
                  {pet.photoUrl ? (
                    <img src={pet.photoUrl} alt={pet.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl">🐾</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900 truncate">{pet.name}</h3>
                    {pet.type === 'cat'
                      ? <Cat size={16} className="text-purple-500 flex-shrink-0" />
                      : <Dog size={16} className="text-yellow-500 flex-shrink-0" />
                    }
                  </div>
                  <p className="text-sm text-gray-500 truncate">{pet.breed}</p>
                  {pet.age !== '—' && (
                    <p className="text-xs text-gray-400">{pet.age} an{Number(pet.age) > 1 ? 's' : ''}</p>
                  )}
                </div>
              </div>

              {/* Details */}
              <div className="border-t border-gray-100 px-4 py-3 bg-gray-50 space-y-1">
                {pet.size && (
                  <p className="text-xs text-gray-500">
                    <span className="font-medium text-gray-700">Taille :</span> {pet.size}
                  </p>
                )}
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <User size={12} />
                  <span className="font-medium text-gray-700 truncate">{pet.ownerName}</span>
                </div>
                <p className="text-xs text-gray-400 truncate">{pet.ownerEmail}</p>
                {pet.source === 'booking' && (
                  <span className="inline-block text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                    via réservation
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
