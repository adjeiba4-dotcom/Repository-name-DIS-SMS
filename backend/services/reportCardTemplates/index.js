// services/reportCardTemplates/index.js
// Extensible report card template registry (STANDARD_A4 today; more later).

const standardA4 = require("./standardA4");
const { BadRequestError } = require("../../errors");

const TEMPLATES = {
    STANDARD_A4: standardA4,
};

function listTemplates() {
    return Object.values(TEMPLATES).map((tpl) => ({
        key: tpl.key,
        name: tpl.name,
        description: tpl.description,
        pageSize: tpl.pageSize,
        orientation: tpl.orientation,
    }));
}

function resolveTemplate(templateKey = "STANDARD_A4") {
    const key = String(templateKey || "STANDARD_A4").toUpperCase();
    const template = TEMPLATES[key];
    if (!template) {
        const available = Object.keys(TEMPLATES).join(", ");
        throw new BadRequestError(
            `Unknown report card template "${templateKey}". Available: ${available}.`
        );
    }
    return template;
}

function buildRenderModel(reportCard, options = {}) {
    const template = resolveTemplate(
        options.templateKey || reportCard.templateKey || "STANDARD_A4"
    );
    return template.buildRenderModel(reportCard, options);
}

module.exports = {
    TEMPLATES,
    listTemplates,
    resolveTemplate,
    buildRenderModel,
};
