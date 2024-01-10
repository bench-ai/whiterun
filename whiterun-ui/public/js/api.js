
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
                alert("This api is protected, you may have used up your anonymous limit. If you wish to continue using this api please login")
                window.location.replace("https://app.bench-ai.com/login");
            }else{
                alert("This api is protected, you may have used up your anonymous limit. If you wish to continue using this api please login")
                throw new Error("unauthorized to use api")
            }
        }else{
            alert(error)
            throw new Error(`status code is: ${number}`)
        }
    }

    // try {
    //     return await apiRequest(requestBody)
    // } catch (error) {
    //     const errorList = error.toString().split(": ")
    //     const number = parseInt(errorList[errorList.length - 1])
    //
    //     if(number === 401){
    //
    //         try{
    //             await refresh()
    //         }catch (error){
    //             if (redirect){
    //                 window.location.replace("https://app.bench-ai.com/login");
    //             }else{
    //                 throw new Error("could not refresh access token")
    //             }
    //         }
    //
    //         try{
    //             const data = await apiRequest(requestBody)
    //             console.log(data)
    //             return data
    //         }catch (error){
    //             console.log(error)
    //             throw new Error(`status code is: ${number}`)
    //         }
    //
    //     }else{
    //         console.log(error)
    //         throw new Error(`status code is: ${number}`)
    //     }
    // }
}