sap.ui.define(["../config/config"], function (config) {
    "use strict";

    
    return {

        async get(endpoint) {
            const response = await fetch(`${config.PROD}${endpoint}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
            if (!response.ok) {
                throw new Error(`Either Server is Down or Failed to retrieve data from server  (${response.status}) ${response.statusText}`);
            }
            return response.json();
        },

        async post(endpoint, payload) {

            const response = await fetch(`${config.PROD}${endpoint}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                }
            );

            
            if (!response.ok) {
                const error =  await response.json();
                throw new Error( error.message ||  `Post Failed - Backend service error  (${response.status}) ${response.statusText}` );
            }

            return response.json();
        },

        async put(endpoint, payload) {

            const response = await fetch(`${config.PROD}${endpoint}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                }
            );

            if (!response.ok) {
                throw new Error( error.message ||  `Updated Failed - Backend service error  (${response.status}) ${response.statusText}` );
            }

            return response.json();
        },

        async delete(endpoint) {

            const response = await fetch(`${config.PROD}${endpoint}`,
                {
                    method: "DELETE"
                }
            );

            if (!response.ok) {
                throw new Error( error.message ||  `Delete Failed - Backend service error  (${response.status}) ${response.statusText}` );
            }

            return response.json();
        }
    };
});