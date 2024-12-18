import React, { useState, useEffect } from "react";

export const AdministradorUsuarios = () => {
    const [usuarios, setUsuarios] = useState([]); // Lista de usuarios
    const [loading, setLoading] = useState(true); // Estado de carga

    // Fetch para obtener perfiles de usuario
    const fetchUsuarios = async () => {
        try {
            let usuariosCompletos = [];

            // Llamar al endpoint de usuarios con perfiles creados
            const responseProfiles = await fetch(`${process.env.BACKEND_URL}/api/user-profiles`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            if (responseProfiles.ok) {
                const dataProfiles = await responseProfiles.json();
                if (Array.isArray(dataProfiles)) {
                    console.log("Usuarios con perfiles creados:", dataProfiles);
                    const usuariosTransformadosProfiles = dataProfiles.map((user) => ({
                        id: user.id,
                        nombre: user.first_name || "Nombre no proporcionado",
                        apellido: user.last_name || "Apellido no proporcionado",
                        documento: user.identification || "Documento no proporcionado",
                        correo: user.email,
                        estado: user.status || "activo",
                    }));
                    usuariosCompletos = [...usuariosCompletos, ...usuariosTransformadosProfiles];
                } else {
                    console.error("El endpoint user-profiles no devolvió un array.");
                }
            } else {
                console.error("Error al obtener usuarios con perfiles creados:", await responseProfiles.text());
            }

            // Llamar al endpoint de usuarios pendientes
            const responsePending = await fetch(`${process.env.BACKEND_URL}/api/admin/pending-users`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            if (responsePending.ok) {
                const dataPending = await responsePending.json();
                if (Array.isArray(dataPending)) {
                    console.log("Usuarios pendientes:", dataPending);
                    const usuariosTransformadosPending = dataPending.map((user) => ({
                        id: user.id,
                        nombre: user.first_name || "Nombre no proporcionado",
                        apellido: user.last_name || "Apellido no proporcionado",
                        documento: user.identification || "Documento no proporcionado",
                        correo: user.email,
                        estado: user.status || "en_revision",
                    }));
                    usuariosCompletos = [...usuariosCompletos, ...usuariosTransformadosPending];
                } else {
                    console.error("El endpoint pending-users no devolvió un array.");
                }
            } else {
                console.error("Error al obtener usuarios pendientes:", await responsePending.text());
            }

            // Actualizar el estado con la lista combinada
            setUsuarios(usuariosCompletos);
        } catch (error) {
            console.error("Error en la solicitud:", error);
        } finally {
            setLoading(false); // Termina la carga
        }
    };

    // Actualiza el estado de un usuario
    const updateUserStatus = async (id, nuevoEstado) => {
        try {
            const response = await fetch(`${process.env.BACKEND_URL}/api/admin/users/${id}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ status: nuevoEstado }),
            });

            if (response.ok) {
                setUsuarios((prevUsuarios) =>
                    prevUsuarios.map((usuario) =>
                        usuario.id === id ? { ...usuario, estado: nuevoEstado } : usuario
                    )
                );
            } else {
                console.error("Error al actualizar el estado del usuario:", await response.text());
            }
        } catch (error) {
            console.error("Error en la solicitud:", error);
        }
    };

    const handleEstadoChange = (id, nuevoEstado) => {
        updateUserStatus(id, nuevoEstado);
    };

    useEffect(() => {
        fetchUsuarios();
    }, []);

    if (loading) {
        return <div className="text-center">Cargando usuarios...</div>;
    }

    return (
        <div className="container-fluid px-2 px-md-3 mt-4">
            <h2 className="mb-4 text-center">Administrador de Usuarios</h2>
            <div className="table-responsive">
                <table className="table table-hover table-bordered table-sm align-middle">
                    <thead className="table-light">
                        <tr>
                            <th>Nombre</th>
                            <th>Apellido</th>
                            <th>Documento</th>
                            <th>Correo</th>
                            <th className="text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usuarios.length > 0 ? (
                            usuarios.map((usuario) => (
                                <tr key={usuario.id || Math.random()}>
                                    <td>{usuario.nombre || "Sin nombre"}</td>
                                    <td>{usuario.apellido || "Sin apellido"}</td>
                                    <td>{usuario.documento || "Sin documento"}</td>
                                    <td>{usuario.correo || "Sin correo"}</td>
                                    <td className="text-center">
                                        <div className="d-flex flex-wrap justify-content-center gap-1">
                                            {usuario.estado === "en_revision" && (
                                                <button
                                                    className="btn btn-sm btn-dark"
                                                    onClick={() => handleEstadoChange(usuario.id, "activo")}
                                                >
                                                    Activar
                                                </button>
                                            )}
                                            {usuario.estado === "activo" && (
                                                <button
                                                    className="btn btn-sm btn-secondary"
                                                    onClick={() => handleEstadoChange(usuario.id, "en_revision")}
                                                >
                                                    Inactivar
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center text-muted">
                                    No hay usuarios disponibles.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
