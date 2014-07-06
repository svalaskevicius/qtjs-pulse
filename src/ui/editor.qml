import QtQuick 2.2
import QtQuick.Layouts 1.1
import QtQuick.Dialogs 1.1
import QtQuick.Controls 1.2
import QtQuick.Controls.Styles 1.1

import PulseEditor 1.0

FocusScope {
    id: editor

    focus: true
    signal activated()
    signal save()

    anchors.fill: parent
    property alias path: file.path

    ScrollView {
        id: editorScrollArea
        anchors.fill: parent
        style : ScrollViewStyle {
            transientScrollBars: true
        }

        focus: true

        contentItem: EditorUI {
            id: editorUi

            text: file.contents

            font.family: "Ubuntu Mono"
            font.pointSize: focus ? 12 : 8

            focus: true
            Keys.enabled: true
            Keys.onPressed: {
                font.pointSize = 8;
                console.log('Key was pressed');
                event.accepted = true;
            }
        }
    }

    EditorFile {
        id: file
    }
}

