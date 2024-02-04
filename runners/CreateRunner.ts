import Runner from '../models/Runner';
import AllowedCommandTypes from '../config/AllowedCommandTypes';
import Workspace from '../models/Workspace';

import * as fs from 'fs';

class CreateRunner extends Runner {

    /**
     * @method setAllowedCommandTypes
     * @description Set the allowed command types
     * @returns void
     */
    public setAllowedCommandTypes(): void 
    {
        this.allowedCommandTypes = AllowedCommandTypes['create'];
    }
  
    /**
     * @method executeCommand
     * @description Execute the command
     * @returns void
     */
    public executeCommand() : void {
        if (this.isValidCommandName()) {
            if (this.isValidCommandValue()) {
                switch (this.getCommandName()) {
                    case 'workspace':
                        this.createWorkspace();
                        break;
                    case 'migration':
                        this.createMigration()   
                    default:
                        break;
                }
            } else {
                console.log(JSON.stringify(
                    {
                        className: this.constructor.name,
                        methodName: 'executeCommand',
                        commandName: this.getCommandName(),
                        commandValue: this.getCommandValue() || '',
                        error: 'Invalid command value'
                    },
                    null,
                    2
                ));
            }
        } else {
            console.log(JSON.stringify(
                {
                    className: this.constructor.name,
                    methodName: 'executeCommand',
                    commandName: '',
                    commandValue: '',
                    error: 'Invalid command name'
                },
                null, 
                2
            ));
        }
    }

    private createMigration() : void {
        const migrationTableName = this.getMigrationTableNameOrNull();

        fs.writeFile('migrations/' + migrationTableName + '.ts', this.getMigrationFileTemplate(), (error) => {
            console.log(error);
        });
    }


    private getMigrationFileTemplate() : string {
        return `import Migration from '../models/Migration';\n\nexport default class ${this.getMigrationTableNameOrNull()} extends Migration {\n\n  public up() : void {\n\n    }\n\n  public down() : void {\n\n    }\n\n}`;
    }

    /**
     * @method createWorkspace
     * @description Create a new workspace
     * @returns void
     */
    private createWorkspace() : void {
        const workspace = new Workspace(
            this.getCommandValue()
        );
        workspace.connect()
            .then(() => workspace.createDatabase())
            .then(() => {
                workspace.createMigrationsTable();
                console.log('Database created successfully!');
                return workspace.disconnect();
            })
            .catch((error) => {
                console.error('Error:', error);
                workspace.disconnect();
            });
    }
}


export default CreateRunner;