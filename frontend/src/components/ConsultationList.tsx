import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Consultation } from '../types';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, IconButton, Button, Chip, Typography, Box, TextField, 
  Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Select, 
  FormControl, InputLabel, SelectChangeEvent, Snackbar, Alert
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Visibility as ViewIcon, 
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const ConsultationList: React.FC = () => {
  const navigate = useNavigate();
  const { consultations, currentUser, currentCenter } = useStore();
  
  // Vérifications de sécurité pour éviter les erreurs filter
  const consultationsList = Array.isArray(consultations) ? consultations : [];
  
  const [filteredConsultations, setFilteredConsultations] = useState<Consultation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(true);

  // Charger les consultations au montage du composant
  useEffect(() => {
    loadConsultations();
  }, []);

  // Filtrer les consultations lorsque consultations, searchTerm ou statusFilter changent
  useEffect(() => {
    let result = [...consultationsList];
    
    // Filtrer par terme de recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(consultation => 
        consultation.patientName?.toLowerCase().includes(term) ||
        consultation.doctorName?.toLowerCase().includes(term) ||
        consultation.diagnosis?.toLowerCase().includes(term) ||
        consultation.id.toLowerCase().includes(term)
      );
    }
    
    // Filtrer par statut
    if (statusFilter !== 'all') {
      result = result.filter(consultation => consultation.status === statusFilter);
    }
    
    // Trier par date (du plus récent au plus ancien)
    result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    setFilteredConsultations(result);
  }, [consultationsList, searchTerm, statusFilter]);

  const loadConsultations = async () => {
    try {
      setLoading(true);
      // Ici, vous pourriez appeler une API pour récupérer les consultations
      // Par exemple: const data = await consultationService.getByCenterId(currentCenter.id);
      // setConsultations(data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des consultations:', error);
      setSnackbar({
        open: true,
        message: 'Erreur lors du chargement des consultations',
        severity: 'error'
      });
      setLoading(false);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleStatusFilterChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value);
  };

  const handleViewConsultation = (consultation: Consultation) => {
    navigate(`/consultations/${consultation.id}`);
  };

  const handleEditConsultation = (consultation: Consultation) => {
    navigate(`/consultations/edit/${consultation.id}`);
  };

  const handleDeleteClick = (consultation: Consultation) => {
    setSelectedConsultation(consultation);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedConsultation) return;
    
    try {
      // Ici, vous pourriez appeler l'API pour supprimer la consultation
      // await consultationService.delete(selectedConsultation.id);
      
      setSnackbar({
        open: true,
        message: 'Consultation supprimée avec succès',
        severity: 'success'
      });
      
      // Recharger les consultations
      await loadConsultations();
    } catch (error) {
      console.error('Erreur lors de la suppression de la consultation:', error);
      setSnackbar({
        open: true,
        message: 'Erreur lors de la suppression de la consultation',
        severity: 'error'
      });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedConsultation(null);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'info';
    }
  };

  const formatStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      'pending': 'En attente',
      'in_progress': 'En cours',
      'completed': 'Terminée',
      'cancelled': 'Annulée'
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography>Chargement des consultations...</Typography>
      </Box>
    );
  }

  return (
    <div>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Liste des Consultations</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/consultations/new')}
        >
          Nouvelle Consultation
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" gap={2} flexWrap="wrap">
          <TextField
            variant="outlined"
            placeholder="Rechercher par patient, médecin ou diagnostic..."
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
            }}
            sx={{ flexGrow: 1, maxWidth: 500 }}
          />
          
          <FormControl variant="outlined" sx={{ minWidth: 200 }}>
            <InputLabel id="status-filter-label">Statut</InputLabel>
            <Select
              labelId="status-filter-label"
              value={statusFilter}
              onChange={handleStatusFilterChange}
              label="Statut"
              startAdornment={<FilterIcon color="action" sx={{ mr: 1 }} />}
            >
              <MenuItem value="all">Tous les statuts</MenuItem>
              <MenuItem value="pending">En attente</MenuItem>
              <MenuItem value="in_progress">En cours</MenuItem>
              <MenuItem value="completed">Terminée</MenuItem>
              <MenuItem value="cancelled">Annulée</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Patient</TableCell>
              <TableCell>Médecin</TableCell>
              <TableCell>Diagnostic</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredConsultations.length > 0 ? (
              filteredConsultations.map((consultation) => (
                <TableRow key={consultation.id} hover>
                  <TableCell>
                    {format(new Date(consultation.date), 'PPpp', { locale: fr })}
                  </TableCell>
                  <TableCell>{consultation.patientName}</TableCell>
                  <TableCell>{consultation.doctorName || 'Non assigné'}</TableCell>
                  <TableCell>
                    {consultation.diagnosis 
                      ? `${consultation.diagnosis.substring(0, 50)}${consultation.diagnosis.length > 50 ? '...' : ''}`
                      : 'Aucun diagnostic'}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={formatStatus(consultation.status)}
                      color={getStatusColor(consultation.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton 
                      color="primary" 
                      onClick={() => handleViewConsultation(consultation)}
                      title="Voir les détails"
                    >
                      <ViewIcon />
                    </IconButton>
                    <IconButton 
                      color="primary" 
                      onClick={() => handleEditConsultation(consultation)}
                      title="Modifier"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      color="error" 
                      onClick={() => handleDeleteClick(consultation)}
                      title="Supprimer"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="textSecondary">
                    Aucune consultation trouvée
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialogue de confirmation de suppression */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer la consultation du {selectedConsultation ? format(new Date(selectedConsultation.date), 'P', { locale: fr }) : ''} 
            pour le patient {selectedConsultation?.patientName} ?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Annuler</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity as any}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ConsultationList;
