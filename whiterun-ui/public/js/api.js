export async function getUser(body) {

    const response = await fetch('http://localhost:8080/api/user/details', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error(`status code is: ${response.status}`);
    }

    // Parse the response body as JSON
    return await response.json(); // Return the data for further use
}


export async function refresh(body) {

    const url = 'http://localhost:8080/api/auth/refresh';

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });

    console.log(response)

    if (!response.ok) {
        console.log("in here")
        console.log(response)
        throw new Error(`status code is: ${response.status}`);
    }

}


export async function saveWorkflow(body) {

    const url = 'http://localhost:8080/api/workflows/save';

    const response = await fetch(url, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        console.log("in here")
        console.log(response)
        throw new Error(`status code is: ${response.status}`);
    }

}


export async function getWorkflow(id){
    const response = await fetch(`http://localhost:8080/api/workflows?id=${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`status code is: ${response.status}`);
    }

    return response.json()
}

export async function uploadImage(fileInput){

    const formData = new FormData();

    formData.append('file', fileInput.files[0]);

    console.log(formData.get("file"))

    const response = await fetch(`http://localhost:8080/api/upload/image`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error(`status code is: ${response.status}`);
    }

    return response.json()
}

export async function imageToImage(body){

    const url = 'http://localhost:8080/api/stability/image-to-image';

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(body),
    });

    // console.log(response)

    if (!response.ok) {
        // console.log("in here")
        console.log(response)
        throw new Error(`status code is: ${response.status}`);
    }


    return response.json()
}


export async function imageToImageMask(body){

    const url = 'http://localhost:8080/api/stability/image-to-image/mask';

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(body),
    });

    // console.log(response)

    if (!response.ok) {
        // console.log("in here")
        console.log(response)
        throw new Error(`status code is: ${response.status}`);
    }


    return response.json()
}


export async function requestInterceptor(apiRequest, requestBody, redirect) {
    try {

        return await apiRequest(requestBody)

    } catch (error) {
        const errorList = error.toString().split(": ")
        const number = parseInt(errorList[errorList.length - 1])

        if(number === 401){
            try{
                console.log("here1")
                await refresh()
                console.log("here2")
                const data = await apiRequest(requestBody)
                console.log(data)
                return data
            }catch (error){
                if (redirect){
                    window.location.replace("http://localhost:3000/login");
                }else{
                    console.log("in exception")
                    console.log("the error is", error)
                    throw new Error("could not refresh access token")
                }
            }
        }

        throw new Error(`status code is: ${number}`)
    }
}