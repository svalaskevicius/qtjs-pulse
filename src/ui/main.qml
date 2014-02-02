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

    onOpenEditor: {
        var component = Qt.createComponent("editor.qml")
        if (component.status === Component.Ready) {
            var editor = component.createObject(appWindow, {path: path})
            if (editor === null) {
                throw new Error("cannot create editor object")
            }
            editor.activated.connect(function() {
                activeEditor = editor
            })
            appWindow.editors.push(editor)
        } else {
            throw new Error("cannot create editor")
        }
    }

    onSaveCurrentEditor: {
        if (activeEditor) {
            activeEditor.save()
        }
    }

    Component.onCompleted: {
    }
}
