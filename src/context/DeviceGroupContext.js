import React, { createContext, useState, useContext } from "react";

const DeviceGroupContext = createContext();

export const useDeviceGroup = () => {
    return useContext(DeviceGroupContext);
};

export const DeviceGroupProvider = ({ children }) => {
    const [deviceGroups, setDeviceGroups] = useState([]);

    return (
        <DeviceGroupContext.Provider value={{ deviceGroups, setDeviceGroups }}>
            {children}
        </DeviceGroupContext.Provider>
    );
};
