import React from 'react';
import Card from './Card';
import Button from './Button';
import { useTournament } from '../hooks/useTournament';
import { DownloadIcon } from './icons/DownloadIcon';

const ExportData: React.FC = () => {
    const { tournamentDetails, players, teams, groups, matches } = useTournament();

    const handleExportJSON = () => {
        const exportData = {
          tournamentDetails,
          players,
          teams,
          groups,
          matches,
        };
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
          JSON.stringify(exportData, null, 2)
        )}`;
        const link = document.createElement("a");
        link.href = jsonString;
        const fileName = tournamentDetails?.name?.toLowerCase().replace(/\s+/g, '-') || 'tournament';
        link.download = `${fileName}-export.json`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };

    return (
        <Card title="Export Tournament Data">
            <p className="text-sm text-subtle-text mt-1 mb-4">
                Download all tournament data, including settings, players, teams, groups, and matches, as a single JSON file. This is useful for backups or for use in other applications.
            </p>
            <Button variant="secondary" onClick={handleExportJSON}>
                <span className="flex items-center justify-center">
                    <DownloadIcon className="w-5 h-5 mr-2" />
                    Export as JSON
                </span>
            </Button>
        </Card>
    );
};

export default ExportData;
