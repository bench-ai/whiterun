
const urlPrefix = "https://app.bench-ai.com"
// const urlPrefix = "http://localhost:8080"


export async function getUser(body) {

    const response = await fetch(`${urlPrefix}/api/user/details`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });

    if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`${errorMessage}: ${response.status}`);
    }

    // Parse the response body as JSON
    return await response.json(); // Return the data for further use
}


export async function refresh(body) {

    const url = `${urlPrefix}/api/auth/refresh`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });

    if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`${errorMessage}: ${response.status}`);
    }

}


export async function saveWorkflow(body) {

    const url = `${urlPrefix}/api/workflows/save`;

    const response = await fetch(url, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`${errorMessage}: ${response.status}`);
    }

}

export async function textToImage(body) {
    const url = `${urlPrefix}/api/stability/text-to-image`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`${errorMessage}: ${response.status}`);
    }

    return response.json()
}

export async function dalleTextToImage(body) {
    const url = `${urlPrefix}/api/dall-e/text-to-image`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`${errorMessage}: ${response.status}`);
    }

    return response.json()
}

export async function imageUpscaler(body) {
    const url = `${urlPrefix}/api/stability/image-to-image/upscale`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`${errorMessage}: ${response.status}`);
    }

    return response.json()
}


export async function getWorkflow(id){
    const response = await fetch(`${urlPrefix}/api/workflows?id=${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });

    if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`${errorMessage}: ${response.status}`);
    }

    return response.json()
}

export async function uploadImage(fileInput){

    const formData = new FormData();

    formData.append('file', fileInput.files[0]);


    const response = await fetch(`${urlPrefix}/api/upload/image`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
    });

    if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`${errorMessage}: ${response.status}`);
    }

    return response.json()
}

export async function imageToImage(body){

    const url = `${urlPrefix}/api/stability/image-to-image`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(body),
    });


    if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`${errorMessage}: ${response.status}`);
    }


    return response.json()
}


export async function imageToImageMask(body){

    const url = `${urlPrefix}/api/stability/image-to-image/mask`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(body),
    });


    if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`${errorMessage}: ${response.status}`);
    }


    return response.json()
}

async function processReplicateRequest(responseData) {
    let status;
    const startTime = Date.now();

    do {
        const response = await fetch(responseData.url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(`${errorMessage}: ${response.status}`);
        }

        status = response.status;

        if (status === 202) {
            const elapsedTime = Date.now() - startTime;
            if (elapsedTime >= 300000) { // 5 minutes in milliseconds
                throw new Error('Timeout: Request took longer than 5 minutes');
            }

            await new Promise(resolve => setTimeout(resolve, 5000));
        } else if (status === 200) {
            return await response.json();
        }

    } while (status === 202);

    throw new Error(`Unexpected processing status: ${status}`);
}

export async function runReplicateAPI(url, body){
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`${errorMessage}: ${response.status}`);
    }

    const initialResponseData = await response.json();

    return await processReplicateRequest(initialResponseData);
}


export async function requestInterceptor(apiRequest, requestBody, redirect) {

    try {
        await refresh()
    }catch (error){
        console.log("unable to refresh token")
    }

    try{
        return await apiRequest(requestBody)
    }catch (error){
        console.log(error)
        const errorList = error.toString().split(": ")
        const number = parseInt(errorList[errorList.length - 1])

        if (number === 401){
            if (redirect){
                alert("Signup / login the product is completely free")
                window.location.replace("https://app.bench-ai.com/login");
            }else{
                // alert("This workflow is protected, You will get ten usages a day. After which If you wish to continue using this workflow please login")
                throw new Error("unauthorized to use api")
            }
        }else{
            alert(error)
            throw new Error(`status code is: ${number}`)
        }
    }
}


export async function realVisXLTextToImage(body) {
    const url = `${urlPrefix}/api/replicate/realvisxl2/text-to-image`;
    return await runReplicateAPI(url, body)
}


export async function controlNetTileUpscaler(body) {
    const url = `${urlPrefix}/api/replicate/hrcnettile11/upscale`;
    return await runReplicateAPI(url, body)
}