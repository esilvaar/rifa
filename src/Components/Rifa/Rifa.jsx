import React, { useState, useEffect, useLayoutEffect } from "react";
// Importa la instancia de la base de datos y las funciones de Firestore
import { db } from "../../firebase";
import { collection, onSnapshot, doc, setDoc, deleteDoc } from "firebase/firestore";
import "./Rifa.css";

// Hook para detectar el tamaño de la ventana (sin cambios)
function useWindowSize() {
  const [size, setSize] = useState([0, 0]);
  useLayoutEffect(() => {
    function updateSize() {
      setSize([window.innerWidth, window.innerHeight]);
    }
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);
  return { width: size[0], height: size[1] };
}

const Rifa = () => {
    const [soldNumbers, setSoldNumbers] = useState([]);
    const [currentNumber, setCurrentNumber] = useState(null);
    const [numberData, setNumberData] = useState({});
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const { width } = useWindowSize();
    const isMobile = width < 768;

    const [notification, setNotification] = useState({ message: '', type: '', show: false });

    useEffect(() => {
        const collectionRef = collection(db, "vendidos");
        
        const unsubscribe = onSnapshot(collectionRef, (querySnapshot) => {
            const newData = {};
            const newSoldNumbers = [];
            
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const raffleNumber = parseInt(doc.id, 10);
                
                newSoldNumbers.push(raffleNumber);
                newData[raffleNumber] = {
                    nombre: data.nombre,
                    telefono: data.telefono,
                };
            });
            
            setNumberData(newData);
            setSoldNumbers(newSoldNumbers);
        });

        return () => unsubscribe();
    }, []);

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type, show: true });
        setTimeout(() => {
            setNotification({ message: '', type: '', show: false });
        }, 2000);
    };

    const handleNumberClick = (num) => {
        setCurrentNumber(num);
        const dataForNumber = numberData[num];
        if (dataForNumber) {
            setName(dataForNumber.nombre);
            setPhone(dataForNumber.telefono);
        } else {
            setName("");
            setPhone("");
        }
    };

    const handleSaveOrUpdate = async (e) => {
        e.preventDefault();
        if (!name.trim() || !currentNumber) return;

        const docRef = doc(db, "vendidos", currentNumber.toString());

        try {
            await setDoc(docRef, {
                nombre: name,
                telefono: phone,
            });
            showNotification(`Número ${currentNumber} guardado/actualizado.`, 'success');
            setCurrentNumber(null);
            setName("");
            setPhone("");
        } catch (error) {
            console.error("Error al guardar/actualizar: ", error);
            showNotification('Error al guardar el número.', 'error');
        }
    };

    const handleDelete = async (e) => {
        e.preventDefault();
        if (!currentNumber || !soldNumbers.includes(currentNumber)) return;
        
        const isConfirmed = window.confirm(`¿Seguro que quieres liberar el número ${currentNumber}?`);
        if (!isConfirmed) {
            return;
        }

        const docRef = doc(db, "vendidos", currentNumber.toString());
        try {
            await deleteDoc(docRef);
            showNotification(`Número ${currentNumber} liberado.`, 'success');
            setCurrentNumber(null);
            setName("");
            setPhone("");
        } catch (error) {
            console.error("Error al eliminar: ", error);
            showNotification('Error al liberar el número.', 'error');
        }
    };

    const renderTable = () => {
        const numRows = isMobile ? 20 : 10;
        const numCols = isMobile ? 5 : 10;
        let tableRows = [];
        for (let i = 0; i < numRows; i++) {
            let tableCols = [];
            for (let j = 0; j < numCols; j++) {
                const cellNumber = i * numCols + j + 1;
                if (cellNumber > 100) continue; 
                
                const isSold = soldNumbers.includes(cellNumber);
                const isSelected = currentNumber === cellNumber;
                
                tableCols.push(
                    <td
                        key={cellNumber}
                        className={`rifa-cell ${isSold ? "sold" : ""} ${isSelected ? "selected" : ""}`}
                        onClick={() => handleNumberClick(cellNumber)}
                    >
                        {cellNumber}
                    </td>
                );
            }
            tableRows.push(<tr key={i}>{tableCols}</tr>);
        }
        return tableRows;
    };

    return (
        <div className="rifa-container">
            <div className={`custom-notification ${notification.type} ${notification.show ? 'show' : ''}`}>
                {notification.message}
            </div>

            {/* --- SECCIÓN DEL TÍTULO MODIFICADA --- */}
            <div className="title-container">
                <h1>Rifa Club de Pesca y Caza Río Toltén</h1>
                <span className="sold-counter">{soldNumbers.length} / 100 Vendidos</span>
            </div>

            <div className="rifa-table-wrapper">
                <table className="rifa-table">
                    <tbody>{renderTable()}</tbody>
                </table>
            </div>
            <form className="rifa-form">
                <h2>
                    {currentNumber ? `Gestionar número ${currentNumber}` : "Selecciona un número"}
                </h2>
                <input
                    type="text"
                    placeholder="Nombre"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!currentNumber}
                />
                <input
                    type="tel"
                    placeholder="Teléfono"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={!currentNumber}
                />
                <button
                    type="button"
                    onClick={handleSaveOrUpdate}
                    disabled={!currentNumber || !name.trim()}
                >
                    {soldNumbers.includes(currentNumber) ? 'Actualizar' : 'Guardar'}
                </button>
                <button
                    type="button"
                    onClick={handleDelete}
                    disabled={!currentNumber || !soldNumbers.includes(currentNumber)}
                >
                    Eliminar 
                </button>
            </form>
        </div>
    );
};

export default Rifa;
