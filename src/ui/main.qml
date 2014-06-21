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

    property var editors : []
    property var activeEditor : null
    signal openEditor(string path)
    signal saveCurrentEditor()

    property var editorComponent : null
    onOpenEditor: {
        var editor = editorComponent.createObject(appWindow)
        if (editor === null) {
            throw new Error("cannot create editor object")
        }
        appWindow.editors.push(editor)
    }

    onSaveCurrentEditor: {
        if (activeEditor) {
            activeEditor.save()
        }
    }

    Component.onCompleted: {
        editorComponent = Qt.createComponent("editor.qml")
        if (editorComponent.status !== Component.Ready) {
            throw new Error("cannot create editor component")
        }
    }
}
