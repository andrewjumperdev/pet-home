import { useDispatch } from "react-redux";
import { setUser } from "../slices/dogUserSlice";
import { useState } from "react";

const CreateDogUserForm = () => {
  const dispatch = useDispatch();
  const [name, setName] = useState("");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState(0);
  const [ownerEmail, setOwnerEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setUser({ name, age, breed, ownerEmail }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <input placeholder="Nombre del perro" onChange={e => setName(e.target.value)} />
      <input placeholder="Raza" onChange={e => setBreed(e.target.value)} />
      <input placeholder="Edad" type="number" onChange={e => setAge(Number(e.target.value))} />
      <input placeholder="Email del dueño" onChange={e => setOwnerEmail(e.target.value)} />
      <button type="submit">Crear perfil</button>
    </form>
  );
};

export default CreateDogUserForm;