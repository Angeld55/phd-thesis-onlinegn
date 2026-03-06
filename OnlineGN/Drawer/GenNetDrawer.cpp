#include <iostream>
#include <fstream>
#include <map>
#include <vector>
#include <string>
#include <sstream>
#include <optional>
#include <iomanip>
using namespace std;

struct Place
{
    std::string name;
    std::string beginTransition;
    std::string endTransition;
};

struct LayoutParameters
{
    std::optional<std::string> outTransitionArrowColor;
    std::optional<std::string> inTransitionArrowColor;
    std::optional<double> transistionWidth;
};

bool generateHtmlFile(const std::string& fileName, const std::string& graphVizString)
{
    std::ofstream ofs(fileName);
    if (!ofs)
    {
        std::cout << "Error while opening the file!";
        return false;
    }

    static std::string header = R"(
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>GraphViz with Viz.js</title>
    </head>
    <body>
        <div id="graph" style="width: 100%; height: 500px;"></div>

        <!-- Include Viz.js from a CDN -->
        <script src="https://cdnjs.cloudflare.com/ajax/libs/viz.js/2.1.2/viz.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/viz.js/2.1.2/full.render.js"></script>

        <script>
            // Your GraphViz dot string
            var dotString = `)";



    std::string footer = R"(
        `;


        // create an instance of Viz
        var viz = new Viz();

        // Render the dot string as an SVG and append it to the div
        viz.renderSVGElement(dotString)
            .then(function(element) {
                document.getElementById('graph').appendChild(element);
            })
            .catch(error => {
                console.error(error);
            });
    </script>
    </body>
    </html>
        )";



    ofs << header << std::endl << graphVizString << std::endl << footer << std::endl;

    return ofs.good();
}

void fillMaps(const std::vector<Place>& genNet,
    std::map<std::string, std::vector<std::string>>& transitionToOutputs,
    std::map<std::string, std::vector<std::string>>& transitionToInputs,
    std::map<std::string, std::string>& placeToTransition)
{
    for (const auto& place : genNet)
    {
        if (place.beginTransition != "_")
        {
            auto findItOutputs = transitionToOutputs.find(place.beginTransition);
            if (findItOutputs != transitionToOutputs.end())
                findItOutputs->second.push_back(place.name);
            else
                transitionToOutputs.insert({ place.beginTransition, {place.name} });

        }

        if (place.endTransition != "_")
        {
            auto findItInputs = transitionToInputs.find(place.endTransition);
            if (findItInputs != transitionToInputs.end())
                findItInputs->second.push_back(place.name);
            else
                transitionToInputs.insert({ place.endTransition, {place.name} });

            placeToTransition.insert({ place.name, place.endTransition });

        }

    }
}


void setDefaultValues(LayoutParameters& lp)
{

    if (!lp.outTransitionArrowColor.has_value())
        lp.outTransitionArrowColor = "black";

    if (!lp.inTransitionArrowColor.has_value())
        lp.inTransitionArrowColor = "black";

    // if transistionWidth is not set, it's calculated by a formula in the code
}


void generateInvisibleNodes(std::stringstream& ss,
    const std::string& transitionName,
    size_t inputsSize,
    const LayoutParameters& lp)
{

    //creating the invisible nodes
    for (int i = 0; i < inputsSize; i++)
        ss << "invis_node_"
        << transitionName
        << "_"
        << i
        << "[color = " << *lp.inTransitionArrowColor
        << ", shape = point, width = 0.01, height = 0.01, class=\"" << "invis_node "
        << "invis_node_" << transitionName << "_" << i << "\"]; " << std::endl;
}

void generateEdgeBetweenInvisibleNodesAndTransistion(std::stringstream& ss,
    const std::string& transitionName,
    size_t inputsSize,
    const LayoutParameters& lp)
{
    for (int i = 0; i < inputsSize; i++)
        ss << "invis_node_"
        << transitionName
        << "_"
        << i
        << "-> " << transitionName << ":w"
        << "[color =" << *lp.inTransitionArrowColor << ", class=\""
        << "invis_node_" << transitionName << "_" << i << "___" << transitionName << "\"];" << std::endl;
}

void generateOutgoingPlacesFromTransition(std::stringstream& ss,
    const std::vector<std::string>& destinations)
{
    ss << "{ rank = same; ";
    for (const auto& outputPlace : destinations)
        ss << outputPlace << ";";
    ss << "}" << std::endl;
}

void generateOutgoingEdgesFromTransition(std::stringstream& ss,
    const std::string transitionName,
    const std::vector<std::string>& destinations,
    const LayoutParameters& lp)
{

    for (const auto& outputPlace : destinations)
        ss << transitionName << " -> " << outputPlace << "[color =" << *lp.outTransitionArrowColor
        << ", class=\"" << transitionName << "___" << outputPlace << "\"" << "];" << std::endl;
}

std::string generateTransitionsString(std::stringstream& ss,
    const std::map<std::string, std::vector<std::string>>& transitionToOutputs,
    const std::map<std::string, std::vector<std::string>>& transitionToInputs,
    LayoutParameters& lp)
{
    for (const auto& transistion : transitionToOutputs)
    {
        const std::string& transitionName = transistion.first;
        const std::vector<std::string>& outputs = transistion.second;

        const auto inputsIter = transitionToInputs.find(transitionName);
        size_t inputsSize = (inputsIter != transitionToInputs.end()) ? inputsIter->second.size() : 0;

        double transistionWidth = 0.005;

        ss << "subgraph cluster_" << transitionName;

        ss << " {" << std::endl; //BEGIN cluster of subgraph - 1
        ss << "style=invis" << std::endl;
        ss << "subgraph cluster_" << transitionName << "_0" << "{" << std::endl; // BEGIN cluster of subgraph - 2
        ss << transitionName << "[" << "label = \"\", shape=rect" << ", height=" << std::max(transistion.second.size(), inputsSize) << ", style=filled, fillcolor=white, width=" << transistionWidth << ", fixedsize=true, class=\"transition " << transitionName << "\"];" << std::endl;

        generateInvisibleNodes(ss, transitionName, inputsSize, lp);

        generateEdgeBetweenInvisibleNodesAndTransistion(ss, transitionName, inputsSize, lp);

        ss << std::endl << "}" << std::endl; //END cluster of subgraph - 2

        const auto outputsIter = transitionToOutputs.find(transitionName);

        generateOutgoingPlacesFromTransition(ss, outputsIter->second);
        generateOutgoingEdgesFromTransition(ss, transitionName, outputsIter->second, lp);

        ss << std::endl;

        ss << " } " << std::endl;  //END cluster of subgraph - 1
    }

    return ss.str();
}

unsigned getFirstFreeInvisibleNode(const std::string& transStr,
    std::map<std::string, unsigned>& transitionToFreeInvisNodeIndex)
{
    auto findIter = transitionToFreeInvisNodeIndex.find(transStr);
    unsigned invisNodeIndex = 0;
    if (findIter != transitionToFreeInvisNodeIndex.end())
    {
        invisNodeIndex = findIter->second;
        return findIter->second++;
    }
    else
    {
        transitionToFreeInvisNodeIndex.insert({ transStr , 1 });
        return 0;
    }
}

void generateOutputEdgesFromPlaces(std::stringstream& res,
    const std::map<std::string, std::string>& placeToTransition,
    const LayoutParameters& lp)
{
    std::map<std::string, unsigned> transitionToFreeInvisNodeIndex;
    for (const auto& placeToTrans : placeToTransition)
    {

        unsigned invisNodeIndex = getFirstFreeInvisibleNode(placeToTrans.second,
            transitionToFreeInvisNodeIndex);

        res << placeToTrans.first
            << " -> " << "invis_node_"
            << placeToTrans.second
            << "_" << invisNodeIndex
            << "[arrowhead=none, color = "
            << *lp.inTransitionArrowColor
            << ", class=\"" << placeToTrans.first
            << "___" << "invis_node_"
            << placeToTrans.second << " "
            << "i" << invisNodeIndex
            << "\"" << "];" << std::endl;
    }
}

void generateCircleNode(std::stringstream& res, const std::vector<Place>& genNet)
{
    for (const auto& place : genNet)
        res << place.name << "[label = \"\", width = 0.3, shape = circle, style=filled, fillcolor=white, class=\"place " << place.name << "\"];" << std::endl;
}


bool validateInput(const std::map<std::string, std::vector<std::string>>& transitionToOutputs,
    const std::map<std::string, std::vector<std::string>>& transitionToInputs,
    const std::map<std::string, std::string>& placeToTransition) //still not used
{
    for (const auto& transitionOutputPair : transitionToOutputs)
    {
        auto it = transitionToInputs.find(transitionOutputPair.first);
        if (it == transitionToInputs.end())
        {
            std::cout << "Transition " << transitionOutputPair.first << " has no input places!" << std::endl;
            return false;
        }
    }
    for (const auto& transitionInputPair : transitionToInputs)
    {
        auto it = transitionToOutputs.find(transitionInputPair.first);
        if (it == transitionToOutputs.end())
        {
            std::cout << "Transition " << transitionInputPair.first << " has no output places!" << std::endl;
            return false;
        }
    }
    return true;
}


std::string generateGraphVizString(const std::vector<Place>& genNet, LayoutParameters& lp)
{
    setDefaultValues(lp);

    std::map<std::string, std::vector<std::string>> transitionToOutputs;
    std::map<std::string, std::vector<std::string>> transitionToInputs;
    std::map<std::string, std::string> placeToTransition;

    fillMaps(genNet, transitionToOutputs, transitionToInputs, placeToTransition);

    if (!validateInput(transitionToOutputs, transitionToInputs, placeToTransition))
        return "";

    std::stringstream res;
    res << "digraph G { ";
    res << "rankdir=LR; ";
    res << "splines=ortho;";
    res << std::endl;

    generateTransitionsString(res,
        transitionToOutputs,
        transitionToInputs,
        lp);

    generateCircleNode(res, genNet);
    generateOutputEdgesFromPlaces(res, placeToTransition, lp);

    res << "}";

    return res.str();
}


bool parseFile(const std::string& fileName, std::vector<Place>& gn, LayoutParameters& params)
{
    std::ifstream ifs(fileName);

    if (!ifs)
    {
        std::cout << "Error while opening the file!";
        return false;
    }

    std::string line;
    bool inGenNetSection = false;
    bool inLayoutParamsSection = false;

    while (std::getline(ifs, line))
    {
        // Remove leading/trailing whitespace
        line.erase(0, line.find_first_not_of(" \t\n\r\f\v"));
        line.erase(line.find_last_not_of(" \t\n\r\f\v") + 1);

        // Handle comments
        size_t commentPos = line.find('#');
        if (commentPos != std::string::npos)
        {
            line = line.substr(0, commentPos);  // Remove the comment
        }

        // Remove leading/trailing whitespace again after removing the comment
        line.erase(0, line.find_first_not_of(" \t\n\r\f\v"));
        line.erase(line.find_last_not_of(" \t\n\r\f\v") + 1);

        if (line.empty()) // Skip empty lines
            continue;

        if (line == "[GenNet]")
        {
            inGenNetSection = true;
            inLayoutParamsSection = false;
            continue;
        }
        else if (line == "[LayoutParams]")
        {
            inGenNetSection = false;
            inLayoutParamsSection = true;
            continue;
        }

        if (inGenNetSection)
        {
            std::istringstream iss(line);
            std::string name, beginTransition, endTransition;
            iss >> name >> beginTransition >> endTransition;

            gn.push_back({ name, beginTransition, endTransition });
        }
        else if (inLayoutParamsSection)
        {
            std::istringstream iss(line);
            std::string key, equalSign, value;

            iss >> key >> equalSign;
            std::getline(iss, value);
            value.erase(0, value.find_first_not_of(" \t\n\r\f\v"));
            value.erase(value.find_last_not_of(" \t\n\r\f\v") + 1);

            if (key == "outTransitionArrowColor")
            {
                if (!value.empty()) params.outTransitionArrowColor = value;
            }
            else if (key == "inTransitionArrowColor")
            {
                if (!value.empty()) params.inTransitionArrowColor = value;
            }
            else if (key == "transistionWidth")
            {
                if (!value.empty()) params.transistionWidth = std::stod(value);
            }
        }
    }

    return true; // Assuming parsing is successful
}

void logInput(const std::vector<Place>& gn, const LayoutParameters& params)
{
    std::cout << "Gen net: " << std::endl;
    std::cout << setw(20) << "Place: " << setw(20) << "Begin transistion: " << setw(20) << "End transistion: " << std::endl;

    for (const auto& place : gn)
    {
        cout << setw(20) << place.name
            << setw(20) << place.beginTransition
            << setw(20) << place.endTransition << std::endl;
    }

    std::cout << "Layout Parameters:" << std::endl;

    if (params.outTransitionArrowColor.has_value())
        std::cout << "  Transistion Output Edges Color: "
        << params.outTransitionArrowColor.value() << std::endl;
    else
        std::cout << "  Transistion Output Edges Color: Not Set" << std::endl;

    if (params.inTransitionArrowColor.has_value())
        std::cout << "  Transistion Input Edges Color: "
        << params.inTransitionArrowColor.value() << std::endl;
    else
        std::cout << "  Transistion Input Edges Color: Not Set" << std::endl;

    if (params.transistionWidth.has_value())
        std::cout << "  Transition Width: "
        << params.transistionWidth.value() << std::endl;
    else
        std::cout << "  Transition Width: Not Set" << std::endl;
}


int main() {

    std::cout << "Enter configuration file path and output file path: " << std::endl;
    std::string inputFile, outputFile;

    std::cout << "> ";

    std::cin >> inputFile >> outputFile;

    if (outputFile.size() < 5 || outputFile.substr(outputFile.size() - 5) != ".html")
    {
        std::cout << "Error: The output file name must end with '.html'!" << std::endl;
        return -1;
    }


    std::vector<Place> vp;
    LayoutParameters lp;

    std::cout << "Parsing the file ..." << std::endl;

    bool parseResult = parseFile(inputFile, vp, lp);

    if (!parseResult)
    {
        std::cout << "Error while parsing input file: " << inputFile << "!";
        return -1;
    }
    std::cout << "Parsing the file done" << std::endl;


    logInput(vp, lp);

    std::cout << "Generating graphViz string..." << std::endl;
    std::string graphVizString = generateGraphVizString(vp, lp);
    std::cout << "Generating graphViz string done!" << std::endl;
    std::cout << "Raw string: " << std::endl << graphVizString << std::endl;

    std::cout << "Generating " << outputFile << "..." << std::endl;
    generateHtmlFile(outputFile, graphVizString);
    std::cout << "Generating done!" << std::endl;

    std::cout << "Press enter to exit." << std::endl;
    int dummy;
    std::cin >> dummy;
}
