fetch("./data/question.json").then((response) => response.json()).then((questions) => {
    const form = $(".form");
    questions.forEach((data) => {
        const div = document.createElement("div");
        div.className = "border-t-2 border-gray-600 my-4 py-2 flex flex-row";
        div.innerHTML = `
            <h3 class="mb-2 mr-4 font-semibold w-5 text-right">${data.id}.</h3>
            <ul class="w-full text-sm font-medium text-gray-900 border border-gray-600 rounded-lg bg-cyan-50"></ul>
        `;

        data.option.forEach((item) => {
            const ul = div.querySelector("ul");
            const li = document.createElement("li");
            li.className = "w-full border-b border-gray-600 rounded-t-lg";
            li.innerHTML = `
                <div class="flex items-center p-3">
                    <input type="radio" id="${item.val}" value="${item.val}" name="${data.id}" class="w-4 h-4 text-black focus:ring-0 cursor-pointer" required>
                    <label for="${item.val}" class="w-full py-3 ms-2 text-sm font-medium text-gray-900 cursor-pointer">
                        ${item.label}
                    </label>
                </div>
            `;
            ul.append(li);
        });
        form.append(div);
    });
});

$(document).ready(function() {
    let formSubmitting = false;
    let setFormSubmitting = function() { formSubmitting = true; };

    $(window).on("beforeunload", function (e) {
        if (formSubmitting) {
            return undefined;
        }

        let confirmationMessage = 'It looks like you have been editing something. '
                                + 'If you leave before saving, your changes will be lost.';

        (e || window.event).returnValue = confirmationMessage;
        return confirmationMessage;
    });
});

function convertToCSV(objArray) {
    const array = typeof objArray != "object" ? JSON.parse(objArray) : objArray;
    let str = "";
    for (let i = 0; i < array.length; i++) {
        let line = "";
        for (let index in array[i]) {
            if (line != "") line += ",";
            line += array[i][index];
        }
        str += line + "\r\n";
    }
    return str;
}

function downloadCSV(data, filename) {
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

$("#personalityForm").submit(async function (event) {
    event.preventDefault();

    let sanguinisCount = 0;
    let plegmatisCount = 0;
    let kolerisCount = 0;
    let melankolisCount = 0;

    const response = await fetch("./data/personality.json");
    const result = await response.json();
    const plegmatisKeys = result[0].key;
    const melankolisKeys = result[1].key;
    const kolerisKeys = result[2].key;
    const sanguinisKeys = result[3].key;

    const answerArr = [];
    const radioButtons = document.querySelectorAll('input[type="radio"]:checked');
    radioButtons.forEach((radio) => {
        const value = radio.value;
        answerArr.push(value);
        if (value) {
            if (sanguinisKeys.includes(value)) {
                sanguinisCount++;
            } else if (plegmatisKeys.includes(value)) {
                plegmatisCount++;
            } else if (kolerisKeys.includes(value)) {
                kolerisCount++;
            } else if (melankolisKeys.includes(value)) {
                melankolisCount++;
            }
        }
    });

    const formResult = {
        name: $("#name").val(),
        sanguine: sanguinisCount,
        choleric: kolerisCount,
        melancholic: melankolisCount,
        phlegmatic: plegmatisCount,
    };

    console.log(formResult)

    return await fetch(`https://appcluster.homtmh.local/administration/personality`, {
        method: "POST",
        body: JSON.stringify(formResult),
        headers: {
            "Content-Type": "application/json",

        }
    })

    // const dataToExport = [
    //     ["Name", "Sanguinis", "Koleris", "Melankolis", "Plegmatis", "All_Answer"],
    //     [
    //       formResult.name,
    //       formResult.sanguinis,
    //       formResult.koleris,
    //       formResult.melankolis,
    //       formResult.plegmatis,
    //       formResult.answer,
    //     ],
    // ];

    // return downloadCSV(dataToExport, formResult.name + ".csv");
});