import React, { useState, useEffect, useLayoutEffect } from "react";
import "./Rifa.css";

const API_URL = "https://68433250e1347494c31f641f.mockapi.io/vendidos";

// --- Hook para detectar el tamaño de la ventana ---
function useWindowSize() {
  const [size, setSize] = useState([0, 0]);
  useLayoutEffect(() => {
    function updateSize() {
      setSize([window.innerWidth, window.innerHeight]);
    }
    window.addEventListener('resize', updateSize);
    updateSize(); // Se llama una vez al inicio para tener el tamaño inicial
    return () => window.removeEventListener('resize', updateSize);
  }, []);
  return { width: size[0], height: size[1] };
}
// --- Fin del Hook ---

const Rifa = () => {
    const [soldNumbers, setSoldNumbers] = useState([]);
    const [currentNumber, setCurrentNumber] = useState(null);
    const [numberData, setNumberData] = useState({});
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");

    // Hook para detectar si la vista es móvil
    const { width } = useWindowSize();
    const isMobile = width < 768; // Definimos el punto de quiebre para móvil

    // ... (El resto de tus funciones: useEffect, handleNumberClick, handleSave, etc. no necesitan cambios)
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(API_URL);
                if (!response.ok) throw new Error("Error al cargar datos");
                const data = await response.json();
                
                const newData = {};
                const newSoldNumbers = [];
                
                data.forEach(item => {
                    if (item.vendido) {
                        const raffleNumber = parseInt(item.numeroRifa, 10);
                        newSoldNumbers.push(raffleNumber);
                        newData[raffleNumber] = {
                            id: item.id,
                            nombre: item.nombre,
                            telefono: item.telefono
                        };
                    }
                });
                setNumberData(newData);
                setSoldNumbers(newSoldNumbers);
            } catch (error) {
                console.error("Error en fetchData:", error);
            }
        };
        fetchData();
    }, []);

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

    const handleSave = async (e) => {
        e.preventDefault();
        if (!name.trim() || !currentNumber) return;

        if (soldNumbers.includes(currentNumber)) {
             alert("Este número ya fue vendido. Use Actualizar.");
             return;
        }

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    numeroRifa: currentNumber.toString(),
                    nombre: name,
                    telefono: phone,
                    vendido: true,
                }),
            });
            if (!response.ok) throw new Error("Error en POST");
            const savedData = await response.json();
            
            const raffleNumber = parseInt(savedData.numeroRifa, 10);
            setSoldNumbers(prev => [...prev, raffleNumber]);
            setNumberData(prev => ({
                ...prev,
                [raffleNumber]: { id: savedData.id, nombre: savedData.nombre, telefono: savedData.telefono }
            }));
            
            alert(`Número ${raffleNumber} guardado!`);
            setCurrentNumber(null);
            setName("");
            setPhone("");

        } catch (error) {
            console.error("Error en handleSave:", error);
        }
    };
    
    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!name.trim() || !currentNumber || !soldNumbers.includes(currentNumber)) return;
        const { id } = numberData[currentNumber];

        try {
            await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    numeroRifa: currentNumber.toString(),
                    nombre: name,
                    telefono: phone,
                    vendido: true
                }),
            });
            setNumberData(prev => ({
                ...prev,
                [currentNumber]: { ...prev[currentNumber], nombre: name, telefono: phone }
            }));
            alert(`Número ${currentNumber} actualizado!`);
        } catch (error) {
            console.error("Error en handleUpdate:", error);
        }
    };

    const handleDelete = async (e) => {
        e.preventDefault();
        if (!currentNumber || !soldNumbers.includes(currentNumber)) return;
        
        if (!window.confirm(`¿Seguro que quieres liberar el número ${currentNumber}?`)) {
            return;
        }

        const { id } = numberData[currentNumber];
        try {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            
            setSoldNumbers(soldNumbers.filter(num => num !== currentNumber));
            const newNumberData = { ...numberData };
            delete newNumberData[currentNumber];
            setNumberData(newNumberData);
            
            setCurrentNumber(null);
            setName("");
            setPhone("");
        } catch (error) {
            console.error("Error en handleDelete:", error);
        }
    };


    // --- LÓGICA DE RENDERIZADO DE TABLA ACTUALIZADA ---
    const renderTable = () => {
        // Decide las dimensiones de la tabla según el tamaño de la pantalla
        const numRows = isMobile ? 20 : 10;
        const numCols = isMobile ? 5 : 10;
        
        let tableRows = [];
        for (let i = 0; i < numRows; i++) {
            let tableCols = [];
            for (let j = 0; j < numCols; j++) {
                // La fórmula para calcular el número de la celda se ajusta dinámicamente
                const cellNumber = i * numCols + j + 1;
                
                // Nos aseguramos de no renderizar más de 100 números
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
            <h1>Rifa de Números</h1>
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
                    onChange={e => setName(e.target.value)}
                    disabled={!currentNumber}
                />
                <input
                    type="tel"
                    placeholder="Teléfono"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    disabled={!currentNumber}
                />
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={!currentNumber || !name.trim() || soldNumbers.includes(currentNumber)}
                >
                    Guardar
                </button>
                <button
                    type="button"
                    onClick={handleUpdate}
                    disabled={!currentNumber || !name.trim() || !soldNumbers.includes(currentNumber)}
                >
                    Actualizar
                </button>
                <button
                    type="button"
                    onClick={handleDelete}
                    disabled={!currentNumber || !soldNumbers.includes(currentNumber)}
                >
                    Eliminar (Liberar)
                </button>
            </form>
        </div>
    );
};

export default Rifa;