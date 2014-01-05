// SSH key generator UI
import QtQuick 2.2
import QtQuick.Controls 1.1
import QtQuick.Layouts 1.1

ApplicationWindow {
    id: appWindow

    title: qsTr("Pulse Editor")

    statusBar: StatusBar {
        RowLayout {
            Label {
                id: status
            }
        }
    }

    property list<Item> editors

    Component.onCompleted: {
        var component = Qt.createComponent("editor.qml")
        if (component.status === Component.Ready) {
            var editor = component.createObject(appWindow)
            if (editor === null) {
                throw new Error("cannot create editor object")
            }
            appWindow.editors.push(editor)
        } else {
            throw new Error("cannot create editor")
        }
    }
}
